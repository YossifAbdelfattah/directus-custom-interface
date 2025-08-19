export default function registerHook({ filter }, { services }) {
  const { ItemsService, CollectionsService, FieldsService } = services;

  // Normalize meta.composite_uniqueness_config to string[][]
  async function getCompositeGroups(collection, schema, knex) {
    const collectionsService = new CollectionsService({ schema, knex, accountability: null });
    const current = await collectionsService.readOne(collection, { fields: ['meta'] });
    const raw = current?.meta?.composite_uniqueness_config ?? null;
    let groups = [];

    if (Array.isArray(raw)) {
      if (raw.every(Array.isArray)) {
        groups = raw;
      } else {
        // legacy: flat array means one group
        groups = [raw];
      }
    } else if (raw && typeof raw === 'object' && Array.isArray(raw.groups)) {
      groups = raw.groups;
    }
    // sanitize: keep only non-empty string fields, dedupe within each group, drop empty groups
    groups = groups
      .map((g) => {
        const seen = new Set();
        const cleaned = [];
        for (const f of Array.isArray(g) ? g : []) {
          if (typeof f === 'string') {
            const s = f.trim();
            if (s && !seen.has(s)) {
              seen.add(s);
              cleaned.push(s);
            }
          }
        }
        return cleaned;
      })
      .filter((g) => g.length > 0);
    return groups.length > 0 ? groups : null;
  }

  function formatErrorMessage(group, collection, existingId) {
    return `Unique constraint failed for group [${group.join(', ')}] in "${collection}". Conflicts with item id '${existingId}'.`;
  }

  filter('items.create', async (input, meta, { database, schema, accountability }) => {
    const collection = meta.collection;
    const groups = await getCompositeGroups(collection, schema, database);
    if (!groups) return input;

    const itemsService = new ItemsService(collection, { schema, knex: database, accountability });
    const fieldsService = new FieldsService({ schema, knex: database, accountability });
    for (const group of groups) {
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
    const groups = await getCompositeGroups(collection, schema, database);
    if (!groups) return input;

    const itemsService = new ItemsService(collection, { schema, knex: database, accountability });

    // Fetch current values needed for all fields in all groups
    const fieldsNeeded = [...new Set(groups.flat())];
    const current = await itemsService.readOne(keys[0], { fields: fieldsNeeded });
    for (const group of groups) {
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
