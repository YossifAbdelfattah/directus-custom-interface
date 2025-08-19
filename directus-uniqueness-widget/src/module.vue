<template>
  <div>
    <div class="wrapper">
      <div v-for="(_model, i) in selects" :key="i" class="container">
        <VSelect
          v-model="selects[i]"
          :items="fields"
          multiple
          :multiplePreviewThreshold="5"
          class="selected-list"
        />
        <VButton
          xLarge
          danger
          @click="removeSelect(i)"
        >Remove this selector</VButton>
      </div>
    </div>
    <div class="add-button-container">
      <VButton xLarge fullWidth @click="addSelect">Add</VButton>
    </div>
  </div>
</template>

<script setup>
import { inject, ref, watch, computed } from 'vue';
import { useCollection } from '@directus/extensions-sdk';

const props = defineProps({
  collectionField: { type: String, default: null },
  collectionName: { type: String, default: null },
  // Persisted value can be string[] (legacy) or string[][] (groups). We emit string[][].
  value: { type: Array, default: () => [] },
  record: { type: Object, default: () => ({}) },
  collection: { type: String, default: null },
  type: { type: String, default: null },
});

const emit = defineEmits(['input']);
const values = inject('values', ref({}));

const chosenCollection = computed(() =>
  values.value?.[props.collectionField] ||
  props.collectionName ||
  values.value?.collection ||
  props.collection
);

const fields = ref([]); // ['title','status', ...]

// --- hydrate groups from props.value ---
function toGroups(val) {
  if (Array.isArray(val) && val.every(Array.isArray)) {
    return val.map((g) => g.slice()); // already string[][]
  }
  if (Array.isArray(val)) {
    return [val.slice()]; // legacy string[]
  }
  return [[]];
}

const selects = ref(toGroups(props.value));
if (selects.value.length === 0) selects.value.push([]);

// --- emit groups verbatim (cleaned) ---
watch(
  selects,
  (groups) => {
    const cleaned = groups.map((g) =>
      (Array.isArray(g) ? g : []).filter((x) => typeof x === 'string' && x.length > 0)
    );
    emit('input', cleaned);
  },
  { deep: true, immediate: true }
);

function addSelect() {
  selects.value.push([]);
}
function removeSelect(index) {
  console.log(index);
  selects.value.splice(index, 1);
  if (selects.value.length === 0) selects.value.push([]);
}

// load visible (non-hidden) fields for the chosen collection
watch(
  chosenCollection,
  async (name) => {
    if (!name) return;
    try {
      const { fields: collectionFields } = useCollection(name);
      fields.value = collectionFields.value
        .filter((f) => !f?.meta?.hidden)
        .map((f) => f.field);
    } catch (err) {
      console.error('Failed to load fields for collection', name, err);
      fields.value = [];
    }
  },
  { immediate: true }
);
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
