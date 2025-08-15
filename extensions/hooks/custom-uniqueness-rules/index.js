export default async function registerHook({ filter, action }, { services, database, getSchema }) {
  const { ItemsService } = services;

  const loadRules = async () => {
    const schema = await getSchema({ database });
    const rulesService = new ItemsService('uniqueness_rules', {
      knex: database,
      schema,
      accountability: null,
    });

    const rows = await rulesService.readByQuery(
      { fields: ['collection', 'rules'], limit: -1 },
      { emitEvents: false } // avoid re-triggering hooks
    );

    const map = new Map(); // collection -> string[] of fields
    for (const r of rows ?? []) {
      // r.rules is JSON; ensure array of field names
      const fields = Array.isArray(r.rules) ? r.rules : [];
      map.set(r.collection, fields);
    }
    console.log('-----------------------------------------------')
    console.log(map);
    console.log('-----------------------------------------------')

    return map;
  };

  let rulesMap = await loadRules();

  // Refresh rules whenever they change
  const refresh = async () => { rulesMap = await loadRules(); };

  action('uniqueness_rules.items.create', refresh);
  action('uniqueness_rules.items.update', refresh);
  action('uniqueness_rules.items.delete', refresh);

  // ---- Shared validators ----
  const ensureUniqueOnCreate = async (collectionName, input, ctx) => {
    const fields = rulesMap.get(collectionName);
    if (!fields || fields.length === 0) return;

    const itemsService = new services.ItemsService(collectionName, {
      knex: ctx.database,
      schema: ctx.schema,
      accountability: ctx.accountability,
    });

    const itemValue = {};
    for (const f of fields) {
      const v = Object.prototype.hasOwnProperty.call(input, f) ? input[f] : '';
      itemValue[f] = v;
    }

    const filterObj = {};
    for (const f of fields) {
      filterObj[f] = itemValue[f] === null ? { _null: true } : { _eq: itemValue[f] };
    }

    const existing = await itemsService.readByQuery({ filter: filterObj, limit: 1 }, { emitEvents: false });
    if (existing.length > 0) {
      throw new Error(`The combination of ${fields.join(', ')} already exists in ${collectionName}.`);
    }
  };

  const ensureUniqueOnUpdate = async (collectionName, input, keys, ctx) => {
    const fields = rulesMap.get(collectionName);
    console.log('-----------------------------------------------')
    console.log(fields);
    console.log('-----------------------------------------------')

    if (!fields || fields.length === 0) return;

    // If none of the watched fields are in the patch, skip
    if (!fields.some((f) => Object.prototype.hasOwnProperty.call(input, f))) return;

    const itemsService = new services.ItemsService(collectionName, {
      knex: ctx.database,
      schema: ctx.schema,
      accountability: ctx.accountability,
    });

    // Get current values for fields not present in the patch
    const current = await itemsService.readOne(keys[0], { fields }, { emitEvents: false });
    console.log('-----------------------------------------------')
    console.log(current);
    console.log('-----------------------------------------------')

    const filterObj = {};
    for (const f of fields) {
      const value = Object.prototype.hasOwnProperty.call(input, f) ? input[f] : current[f];
      filterObj[f] = value === null ? { _null: true } : { _eq: value };
    }
    console.log('-----------------------------------------------')
    console.log(filterObj);
    console.log('-----------------------------------------------')

    const existing = await itemsService.readByQuery({ filter: filterObj, limit: 1 }, { emitEvents: false });
    console.log('-----------------------------------------------')
    console.log(existing)
    console.log('-----------------------------------------------')
    if (existing.length > 0) {
      throw new Error(`The combination of ${fields.join(', ')} already exists in ${collectionName}.`);
    }
  };

  // ---- Single global hooks (apply to every collection) ----
  filter('items.create', async (input, meta, ctx) => {
    await ensureUniqueOnCreate(meta.collection, input, ctx);
    return input;
  });

  filter('items.update', async (input, meta, ctx) => {
    await ensureUniqueOnUpdate(meta.collection, input, meta.keys, ctx);
    return input;
  });
}
