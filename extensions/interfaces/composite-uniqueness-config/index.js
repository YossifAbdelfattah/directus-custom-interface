import { inject, ref, computed, onMounted, getCurrentInstance, watchEffect, watch, resolveComponent, openBlock, createBlock } from 'vue';
import { useStores, useCollection } from '@directus/extensions-sdk';

var e=[],t=[];function n(n,r){if(n&&"undefined"!=typeof document){var a,s=!0===r.prepend?"prepend":"append",d=!0===r.singleTag,i="string"==typeof r.container?document.querySelector(r.container):document.getElementsByTagName("head")[0];if(d){var u=e.indexOf(i);-1===u&&(u=e.push(i)-1,t[u]={}),a=t[u]&&t[u][s]?t[u][s]:t[u][s]=c();}else a=c();65279===n.charCodeAt(0)&&(n=n.substring(1)),a.styleSheet?a.styleSheet.cssText+=n:a.appendChild(document.createTextNode(n));}function c(){var e=document.createElement("style");if(e.setAttribute("type","text/css"),r.attributes)for(var t=Object.keys(r.attributes),n=0;n<t.length;n++)e.setAttribute(t[n],r.attributes[t[n]]);var a="prepend"===s?"afterbegin":"beforeend";return i.insertAdjacentElement(a,e),e}}

var css = "\n.selected-list[data-v-cd59a7ea] {\n  margin-top: 1rem;\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n";
n(css,{});

var _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};

const _sfc_main = {
  __name: 'module',
  props: {
  // Directus passes this field value; on new items it's often null
  value: { type: Array, default: null },
},
  emits: ['update:modelValue', 'input'],
  setup(__props, { emit: __emit }) {

const props = __props;
console.log('----------------------------------------');
console.log('Props:', props.value);
const emit = __emit;

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
    emit('update:modelValue', arr);
    emit('input', arr); // optional legacy compatibility
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
onMounted(() => {
  const p = getCurrentInstance()?.vnode?.props ?? {};
  console.log('Has update listener:', !!p['onUpdate:modelValue']);
  console.log('Has input listener: ', !!p.onInput);
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

return (_ctx, _cache) => {
  const _component_v_select = resolveComponent("v-select");

  return (openBlock(), createBlock(_component_v_select, {
    modelValue: selected.value,
    "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => ((selected).value = $event)),
    items: fields.value,
    multiple: "",
    label: "Rules",
    "item-text": "field",
    "item-value": "field",
    class: "selected-list"
  }, null, 8 /* PROPS */, ["modelValue", "items"]))
}
}

};
var Module = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-cd59a7ea"],['__file',"module.vue"]]);

var index = {
  id: 'composite-uniqueness-config',
  name: 'Composite Uniqueness Config',
  icon: 'fingerprint',
  description: 'Select fields that must be unique in combination',
  types: ['json'],
  group: 'standard',
  component: Module
};

export { index as default };
