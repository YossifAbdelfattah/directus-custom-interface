import { inject, ref, computed, watch, resolveComponent, openBlock, createElementBlock, createElementVNode, Fragment, renderList, createVNode, withCtx, createTextVNode } from 'vue';
import { useCollection } from '@directus/extensions-sdk';

var e=[],t=[];function n(n,r){if(n&&"undefined"!=typeof document){var a,s=!0===r.prepend?"prepend":"append",d=!0===r.singleTag,i="string"==typeof r.container?document.querySelector(r.container):document.getElementsByTagName("head")[0];if(d){var u=e.indexOf(i);-1===u&&(u=e.push(i)-1,t[u]={}),a=t[u]&&t[u][s]?t[u][s]:t[u][s]=c();}else a=c();65279===n.charCodeAt(0)&&(n=n.substring(1)),a.styleSheet?a.styleSheet.cssText+=n:a.appendChild(document.createTextNode(n));}function c(){var e=document.createElement("style");if(e.setAttribute("type","text/css"),r.attributes)for(var t=Object.keys(r.attributes),n=0;n<t.length;n++)e.setAttribute(t[n],r.attributes[t[n]]);var a="prepend"===s?"afterbegin":"beforeend";return i.insertAdjacentElement(a,e),e}}

var css = "\n.selected-list[data-v-b66b7c0e] {\n  margin-top: 0rem;\n}\n.container[data-v-b66b7c0e] {\n  display: flex;\n  gap: 5rem;\n  margin-bottom: 1rem;\n}\n.add-button-container[data-v-b66b7c0e] {\n  margin-top: 0rem;\n}\n\n";
n(css,{});

var _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};

const _hoisted_1 = { class: "wrapper" };
const _hoisted_2 = { class: "add-button-container" };


const _sfc_main = {
  __name: 'module',
  props: {
  collectionField: { type: String, default: null },
  collectionName: { type: String, default: null },
  // Persisted value can be string[] (legacy) or string[][] (groups). We emit string[][].
  value: { type: Array, default: () => [] },
  record: { type: Object, default: () => ({}) },
  collection: { type: String, default: null },
  type: { type: String, default: null },
},
  emits: ['input'],
  setup(__props, { emit: __emit }) {

const props = __props;

const emit = __emit;
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

return (_ctx, _cache) => {
  const _component_VSelect = resolveComponent("VSelect");
  const _component_VButton = resolveComponent("VButton");

  return (openBlock(), createElementBlock("div", null, [
    createElementVNode("div", _hoisted_1, [
      (openBlock(true), createElementBlock(Fragment, null, renderList(selects.value, (_model, i) => {
        return (openBlock(), createElementBlock("div", {
          key: i,
          class: "container"
        }, [
          createVNode(_component_VSelect, {
            modelValue: selects.value[i],
            "onUpdate:modelValue": $event => ((selects.value[i]) = $event),
            items: fields.value,
            multiple: "",
            multiplePreviewThreshold: 5,
            class: "selected-list"
          }, null, 8 /* PROPS */, ["modelValue", "onUpdate:modelValue", "items"]),
          createVNode(_component_VButton, {
            xLarge: "",
            danger: "",
            onClick: $event => (removeSelect(i))
          }, {
            default: withCtx(() => _cache[0] || (_cache[0] = [
              createTextVNode("Remove this selector")
            ])),
            _: 2 /* DYNAMIC */,
            __: [0]
          }, 1032 /* PROPS, DYNAMIC_SLOTS */, ["onClick"])
        ]))
      }), 128 /* KEYED_FRAGMENT */))
    ]),
    createElementVNode("div", _hoisted_2, [
      createVNode(_component_VButton, {
        xLarge: "",
        fullWidth: "",
        onClick: addSelect
      }, {
        default: withCtx(() => _cache[1] || (_cache[1] = [
          createTextVNode("Add")
        ])),
        _: 1 /* STABLE */,
        __: [1]
      })
    ])
  ]))
}
}

};
var Module = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-b66b7c0e"],['__file',"module.vue"]]);

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
