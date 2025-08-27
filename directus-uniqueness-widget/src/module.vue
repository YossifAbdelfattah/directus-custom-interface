<template>
  <div>
    <!-- Only render the selectors when there is at least one group -->
    <div v-if="fieldGroups.length" class="wrapper">
      <div v-for="(_model, i) in fieldGroups" :key="i" class="container">
        <VSelect v-model="fieldGroups[i]" :items="fields" placeholder="Select Your Fields" multiple :multiplePreviewThreshold="5"
          class="selected-list" />
        <VButton xLarge danger @click="removeSelect(i)">Remove this selector</VButton>
      </div>
    </div>

    <div class="add-button-container">
      <VButton xLarge fullWidth @click="addSelect">Add</VButton>
    </div>
  </div>
</template>

<script setup>
import { inject, ref, watch, computed } from 'vue';
// Use this package for local development only
// import { useCollection } from '@directus/extensions-sdk';

// Use community package when building for stage/prod
import { useCollection } from '@wbce-d9/extensions-sdk';

const props = defineProps({
  value: { type: Array, default: () => [] }, // string[][]
});

const emit = defineEmits(['input']);
const values = inject('values', ref({}));

// Which collection to read fields from
const chosenCollection = computed(() => values.value?.collection);

// All available fields in the chosen collection
const fields = ref([]);

// Start with saved groups if present; otherwise start with no rows (only "Add" visible)
const fieldGroups = ref(
  Array.isArray(props.value) && props.value.length ? props.value.map((g) => g.slice()) : []
);

// Emit only non-empty groups; [] when nothing selected
watch(
  fieldGroups,
  () => {
    const groupsToPersist = fieldGroups.value
      .filter((group) => group.length)
      .map((group) => [...group]);
    emit('input', groupsToPersist);
  },
  { deep: true, immediate: true }
);

// Load visible (non-hidden) fields whenever the target collection changes
watch(
  chosenCollection,
  (name) => {
    if (!name) {
      fields.value = [];
      return;
    }
    const { fields: collectionFields } = useCollection(name);
    fields.value = collectionFields.value
      .filter((f) => !f?.meta?.hidden)
      .map((f) => f.field);
  },
  { immediate: true }
);

// Add a new empty selector row (reveals the VSelect + Remove UI)
function addSelect() {
  fieldGroups.value.push([]);
}

// Remove a selector row; do NOT re-add an empty row when none remain
function removeSelect(index) {
  fieldGroups.value.splice(index, 1);
}
</script>

<style scoped>
.selected-list {
  margin-top: 0rem;
}

.container {
  display: flex;
  gap: 5rem;
  margin-bottom: 1rem;
}

.add-button-container {
  margin-top: 0rem;
}
</style>
