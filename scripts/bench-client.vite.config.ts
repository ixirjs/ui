import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Client-side benchmark build — the browser half of `bench.vite.config.ts`. Same aliases and the
// same `$app/environment` stub; two things deliberately invert:
//
//  1. **Svelte is bundled, not external.** The SSR config keeps it external so two bundles share
//     one `ssr_context` in a node process. Here there is no bare-specifier resolver at all, so the
//     runtime has to come along.
//  2. **IIFE, not ESM.** The driver injects the bundle with `addScriptTag({ content })` rather than
//     serving it: Chromium blocks module scripts over `file://` (CORS), and a self-contained IIFE
//     needs neither a module graph nor an HTTP server for a benchmark that talks to nothing.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lib = path.join(root, 'src/lib');

export default defineConfig({
	root,
	plugins: [svelte({ preprocess: [vitePreprocess()] })],
	resolve: {
		alias: [
			{ find: /^\$ixirjs\/ui$/, replacement: lib },
			{ find: /^\$ixirjs\/ui\//, replacement: lib + '/' },
			{ find: /^\$lib\//, replacement: lib + '/' },
			{ find: /^\$app\/environment$/, replacement: path.join(lib, 'test/perf/app-environment.ts') },
			{ find: /^\$shadcn\//, replacement: path.join(root, 'bench/vs-shadcn') + '/' }
		]
	},
	build: {
		outDir: path.join(root, process.env.BENCH_CLIENT_OUT ?? '.bench-out/client'),
		emptyOutDir: true,
		// Not minified, for the same reason the SSR bundle is not: the profile should name library
		// frames. It is also never shipped, so size is irrelevant.
		minify: false,
		target: 'esnext',
		sourcemap: false,
		lib: {
			// Parameterised for the same reason the SSR config is: a second client benchmark should
			// share the alias block, the IIFE format and the environment stub rather than fork them.
			// Defaults reproduce `bench:nesting:client` exactly.
			entry: path.join(
				lib,
				process.env.BENCH_CLIENT_ENTRY ?? 'test/perf/nesting/nesting-client.svelte.ts'
			),
			name: process.env.BENCH_CLIENT_NAME ?? 'NestingBench',
			formats: ['iife'],
			fileName: () => process.env.BENCH_CLIENT_FILE ?? 'nesting-client.js'
		}
	}
});
