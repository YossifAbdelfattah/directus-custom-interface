# Directus – Composite Uniqueness (Docker + Extensions)

## Quick start

Steps:

1. Start Directus
	 - Ports: `http://localhost:8055`
	 - Data: mounted SQLite at `./database/database.sqlite`
	 - Extensions: live-mounted from `./extensions`

	 ```sh
	 docker-compose up --build
	 ```

2. Sign in
	 - Email: `foo@bar.de`
	 - Password: `foobar`

## What the extensions do

- Interface (`composite-uniqueness-config`)
	- A small Vue UI to select multiple “field groups.”
	- Each group is an array of field names, e.g. `["slug", "locale"]`.
	- Saves to the collection meta under `composite_uniqueness_config`.

- Hook (`custom-uniqueness-rules`)
	- On item create/update, for each configured group it checks whether another item exists with the same values.
	- Supports `null` comparisons and falls back to field default values on create when an input value isn’t provided.

## Configure composite-uniqueness rules

You can configure per collection using the Admin UI.

### Admin UI

- Open the collection settings in the Data Model.
- Look for the “Composite Uniqueness Config” control and select one or more groups of fields.
- Save the collection.
- Check if the Uniqueness constraint is working on your collection.

## Development

This repo includes the source for the interface in `directus-uniqueness-widget/` and the compiled output already placed in `extensions/interfaces/composite-uniqueness-config/`.

Rebuild the interface after making changes:

```sh
cd directus-uniqueness-widget
npm install
npm run build
```

The build script compiles to `directus-uniqueness-widget/dist/index.js` and copies it to `extensions/interfaces/composite-uniqueness-config/index.js`.

Notes on versions:

- Docker image: `ghcr.io/directus/directus:9.26.0`
- Interface dev SDK: `@wbce-d9/extensions-sdk`

**HINT**
For our case, in local development you should use '@directus/extensions-sdk' instead. Once done with local testing, use the community package '@wbce-d9/extensions-sdk' and rebuild the interface then copy it to the infrastructure repo.

