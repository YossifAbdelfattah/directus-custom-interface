import { inject, ref, computed, watch, resolveComponent, openBlock, createElementBlock, createCommentVNode, Fragment, renderList, createVNode, withCtx, createTextVNode, createElementVNode } from 'vue';
import { useCollection } from '@wbce-d9/extensions-sdk';

const _hoisted_1 = {
  key: 0,
  class: "wrapper"
};
const _hoisted_2 = { class: "add-button-container" };


var script = {
  __name: 'module',
  props: {
  value: { type: Array, default: () => [] }, // string[][]
},
  emits: ['input'],
  setup(__props, { emit: __emit }) {

const props = __props;

const emit = __emit;
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

return (_ctx, _cache) => {
  const _component_VSelect = resolveComponent("VSelect");
  const _component_VButton = resolveComponent("VButton");

  return (openBlock(), createElementBlock("div", null, [
    createCommentVNode(" Only render the selectors when there is at least one group "),
    (fieldGroups.value.length)
      ? (openBlock(), createElementBlock("div", _hoisted_1, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(fieldGroups.value, (_model, i) => {
            return (openBlock(), createElementBlock("div", {
              key: i,
              class: "container"
            }, [
              createVNode(_component_VSelect, {
                modelValue: fieldGroups.value[i],
                "onUpdate:modelValue": $event => ((fieldGroups.value[i]) = $event),
                items: fields.value,
                placeholder: "Select Your Fields",
                multiple: "",
                multiplePreviewThreshold: 5,
                class: "selected-list"
              }, null, 8 /* PROPS */, ["modelValue", "onUpdate:modelValue", "items"]),
              createVNode(_component_VButton, {
                xLarge: "",
                danger: "",
                onClick: $event => (removeSelect(i))
              }, {
                default: withCtx(() => [...(_cache[0] || (_cache[0] = [
                  createTextVNode("Remove this selector")
                ]))]),
                _: 2 /* DYNAMIC */,
                __: [0]
              }, 1032 /* PROPS, DYNAMIC_SLOTS */, ["onClick"])
            ]))
          }), 128 /* KEYED_FRAGMENT */))
        ]))
      : createCommentVNode("v-if", true),
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

var e=[],t=[];function n(n,r){if(n&&"undefined"!=typeof document){var a,s=!0===r.prepend?"prepend":"append",d=!0===r.singleTag,i="string"==typeof r.container?document.querySelector(r.container):document.getElementsByTagName("head")[0];if(d){var u=e.indexOf(i);-1===u&&(u=e.push(i)-1,t[u]={}),a=t[u]&&t[u][s]?t[u][s]:t[u][s]=c();}else a=c();65279===n.charCodeAt(0)&&(n=n.substring(1)),a.styleSheet?a.styleSheet.cssText+=n:a.appendChild(document.createTextNode(n));}function c(){var e=document.createElement("style");if(e.setAttribute("type","text/css"),r.attributes)for(var t=Object.keys(r.attributes),n=0;n<t.length;n++)e.setAttribute(t[n],r.attributes[t[n]]);var a="prepend"===s?"afterbegin":"beforeend";return i.insertAdjacentElement(a,e),e}}

var css = "\n.selected-list[data-v-b52a34f6] {\n  margin-top: 0rem;\n}\n.container[data-v-b52a34f6] {\n  display: flex;\n  gap: 5rem;\n  margin-bottom: 1rem;\n}\n.add-button-container[data-v-b52a34f6] {\n  margin-top: 0rem;\n}\n";
n(css,{});

script.__scopeId = "data-v-b52a34f6";
script.__file = "src/module.vue";

var index = {
  id: 'composite-uniqueness-config',
  name: 'Composite Uniqueness Config',
  icon: 'fingerprint',
  description: 'Select fields that must be unique in combination',
  types: ['json'],
  group: 'standard',
  component: script
};

export { index as default };
