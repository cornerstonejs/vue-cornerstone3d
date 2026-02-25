import { fileURLToPath, URL } from "node:url"
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import { viteCommonjs } from "@originjs/vite-plugin-commonjs"

/**
 * Vite configuration for the application.
 *
 * @remarks
 * This configuration is mostly standard Vite + Vue setup, with specific accommodations for:
 * - WASM decoders used by Cornerstone libraries
 * - DICOM parser which currently uses CommonJS format (planned migration to ESM)
 *
 * @description
 * Key configuration points:
 * - Uses vite-plugin-commonjs to handle the DICOM parser's CommonJS format
 * - Configures worker format as ES modules
 * - Excludes Cornerstone CODEC packages from dependency optimization to handle WASM properly
 * - Explicitly includes dicom-parser in optimization
 * - Ensures WASM files are properly handled as assets
 *
 * @example
 * To use additional WASM decoders, add them to the optimizeDeps.exclude array:
 * ```ts
 * optimizeDeps: {
 *   exclude: [
 *     "@cornerstonejs/dicom-image-loader",
 *     // ... existing codecs
 *   ]
 * }
 * ```
 */
// Serve at root (/) or under a subpath (e.g. /subpath/). Set BASE_PATH when running scripts.
const base = process.env.BASE_PATH ?? "/"

export default defineConfig({
  base,
  plugins: [
    vue(),
    vueJsx(),
    // for dicom-parser
    viteCommonjs(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // server: {
  //   fs: {
  //     strict: false,
  //   },
  // },
  // seems like only required in dev mode
  optimizeDeps: {
    exclude: ["@cornerstonejs/dicom-image-loader"],
    include: ["dicom-parser"],
  },
  worker: {
    format: "es",
    rollupOptions: {
      external: ["@icr/polyseg-wasm"],
    },
  },
})
