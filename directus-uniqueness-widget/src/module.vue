<template>
  <v-select
    v-model="selected"
    :items="fields"
    multiple
    label="Rules"
    item-text="field"
    item-value="field"
    class="selected-list"
  />
</template>

<script setup>
import { inject, ref, computed, watch, watchEffect, onMounted } from 'vue';
import { useCollection, useStores } from '@directus/extensions-sdk';

const props = defineProps({
  // Directus passes this field value; on new items it's often null
  value: { type: Array, default: null },
});
console.log('----------------------------------------');
console.log('Props:', props.value);
const emit = defineEmits(['update:modelValue', 'input']);

// Current item values from Directus Item Editor
const values = inject('values', ref({}));
console.log('----------------------------------------');
console.log('Current item values:', values.value);
console.log('----------------------------------------');

/**
 * Keep your local "selected", but wire it to the Directus form store.
 * - Getter normalizes null -> []
 * - Setter emits update:modelValue (and input for legacy)
 */
const selected = computed({
  get: () => (Array.isArray(props.value) ? props.value : []),
  set: (v) => {
    const arr = Array.isArray(v) ? v : [];
    emit('input', arr);
  },
});
console.log('selected value:', selected.value);
console.log('----------------------------------------');
// On create, coerce null -> [] so "required" doesn't fail with null
onMounted(() => {
  if (props.value == null) selected.value = [];
});

// Determine the chosen collection name
const chosenCollection = computed(() => {
  const raw = values.value?.collection ?? '';
  return typeof raw === 'string' ? raw.trim() : '';
});

// Validate against admin store to avoid "stores could not be found"
const { useCollectionsStore } = useStores();
const collectionsStore = useCollectionsStore();

const validName = computed(() => {
  const n = chosenCollection.value;
  return n && collectionsStore.collections?.some(c => c.collection === n) ? n : null;
});

// Bind once; pass reactive ref (validName)
const { fields: rawFields } = useCollection(validName);

// Visible fields (exclude hidden)
const fields = ref([]);

watchEffect(() => {
  if (!validName.value) {
    fields.value = [];
    return;
  }
  fields.value = (rawFields.value || []).filter(f => !f?.meta?.hidden);
});

// Clear selection when collection becomes invalid
watch(validName, (n) => {
  if (!n) {
    selected.value = []; // clears v-select and writes [] to form state
  }
});
</script>


<style scoped>
.selected-list {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
