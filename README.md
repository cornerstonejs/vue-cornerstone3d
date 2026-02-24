https://stackblitz.com/~/github.com/cornerstonejs/vue-cornerstone3d

# vue-cornerstone3d

Vue 3 + Vite + Cornerstone3D. This template helps you develop with Vue 3 and run the viewer at the site root or under a subpath (e.g. `/subpath/`).

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
# or
yarn
```

## Build and run

### Main path (app at `/`)

- **Dev:** `npm run dev` → open http://localhost:5173/
- **Build:** `npm run build` → output in `dist/`
- **Preview:** `npm run preview` → open http://localhost:4173/

### Subpath (app at `/subpath/`)

- **Dev:** `npm run dev:subpath` → open http://localhost:5173/subpath/
- **Build:** `npm run build:subpath` → output in `dist/` (asset URLs use `/subpath/`)
- **Preview:** After `npm run build:subpath`, run `npm run preview:subpath`. The built app expects to be served under `/subpath/`; for a quick local check you can use `npm run dev:subpath` instead.

For production, deploy the `dist/` from `build:subpath` to a server that serves the app under `/subpath/` (e.g. nginx `location /subpath/` or a static host with base path support).
