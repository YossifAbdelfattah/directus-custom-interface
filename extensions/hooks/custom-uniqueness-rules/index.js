export default function registerHook({ filter }, { services }) {
  const { ItemsService, CollectionsService, FieldsService } = services;

  // Get composite-uniqueness groups from collection meta and return only valid (non-empty) groups.
  async function getCompositeGroups(collection, schema, knex) {
    const collectionsService = new CollectionsService({ schema, knex, accountability: null });
    const current = await collectionsService.readOne(collection, { fields: ['meta'] });
    const raw = current?.meta?.composite_uniqueness_config;
    return filterValidCompositeGroups(raw);
  }

  // Keep only non-empty groups; treat empty or invalid input as "no rules" (null).
  function filterValidCompositeGroups(groups) {
    if (!Array.isArray(groups)) return null;
    return groups.filter((g) => Array.isArray(g) && g.length > 0) || null;
  }

  function formatErrorMessage(group, collection, existingId) {
    return `Unique constraint failed for group [${group.join(', ')}] in "${collection}". Conflicts with item id '${existingId}'.`;
  }

  filter('items.create', async (input, { collection }, { database, schema, accountability }) => {
    const ruleGroups = await getCompositeGroups(collection, schema, database);
    if (!ruleGroups) return input;

    const itemsService = new ItemsService(collection, { schema, knex: database, accountability });
    const fieldsService = new FieldsService({ schema, knex: database, accountability });
    for (const group of ruleGroups) {
      const filterObj = {};
      for (const field of group) {
        const value = input[field];
        const defaultField = await fieldsService.readOne(collection, field).then((field) => field.schema.default_value);
        const finalValue = value ?? defaultField;
        filterObj[field] = finalValue === null ? { _null: true } : { _eq: finalValue };
      }
      const existing = await itemsService.readByQuery({ filter: filterObj, limit: 1 });
      if (existing.length > 0) {
        throw new Error(formatErrorMessage(group, collection, existing[0].id));
      }
    }

    return input;
  });

  filter('items.update', async (input, { collection, keys }, { database, schema, accountability }) => {

    // If no groups are defined, skip uniqueness checks
    const ruleGroups = await getCompositeGroups(collection, schema, database);
    if (!ruleGroups) return input;

    const itemsService = new ItemsService(collection, { schema, knex: database, accountability });

    // Fetch current values needed for all fields in all groups
    const fieldsNeeded = [...new Set(ruleGroups.flat())];
    const current = await itemsService.readOne(keys[0], { fields: fieldsNeeded });
    for (const group of ruleGroups) {
      const filterObj = {};
      for (const field of group) {
        const value = Object.prototype.hasOwnProperty.call(input, field) ? input[field] : current[field];
        filterObj[field] = value === null ? { _null: true } : { _eq: value };
      }

      const existing = await itemsService.readByQuery({ filter: filterObj, limit: 1 });
      
      /** Check if the existing item is not the one being updated
       *  keys[0] needs to be converted to a Number for proper comparison 
       **/
      if (existing.length > 0 && existing[0].id !== Number(keys[0])) {
        throw new Error(formatErrorMessage(group, collection, existing[0].id));
      }
    }

    return input;
  });
}
