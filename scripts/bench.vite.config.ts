import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Standalone SSR benchmark build. Deliberately does NOT use the sveltekit() plugin: Kit owns the
// build output and would render the whole app instead of this entry. Aliases mirror the `kit.alias`
// block in svelte.config.js, plus a `$app/environment` stub.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lib = path.join(root, 'src/lib');

// Entry is parameterised so a second benchmark (`bench:nesting`) reuses this config rather than
// forking it — the alias block, the environment stub and the `external: svelte` rule are the parts
// worth sharing, and all three are entry-independent. Defaults reproduce `bench:ssr` exactly.
const entry = process.env.BENCH_ENTRY ?? 'test/perf/ssr-bench.ts';
const outDir = process.env.BENCH_OUT ?? '.bench-out';

export default defineConfig({
	root,
	plugins: [svelte({ preprocess: [vitePreprocess()] })],
	resolve: {
		alias: [
			{ find: /^\$ixirjs\/ui$/, replacement: lib },
			{ find: /^\$ixirjs\/ui\//, replacement: lib + '/' },
			{ find: /^@ixirjs\/ui\/preset$/, replacement: path.join(lib, 'preset') },
			{ find: /^@ixirjs\/ui\/shared$/, replacement: path.join(lib, 'public/shared.ts') },
			{ find: /^@ixirjs\/ui\/utils$/, replacement: path.join(lib, 'public/utils.ts') },
			{
				find: /^@ixirjs\/ui\/experimental$/,
				replacement: path.join(lib, 'public/experimental.ts')
			},
			{
				find: /^@ixirjs\/ui\/components\//,
				replacement: path.join(lib, 'public/components') + '/'
			},
			{ find: /^@ixirjs\/ui$/, replacement: lib },
			{ find: /^\$lib\//, replacement: lib + '/' },
			{ find: /^\$app\/environment$/, replacement: path.join(lib, 'test/perf/app-environment.ts') }
		]
	},
	build: {
		ssr: path.join(lib, entry),
		outDir: path.join(root, outDir),
		emptyOutDir: true,
		minify: false,
		target: 'esnext',
		sourcemap: false,
		// Keep Svelte external so every bundle shares one runtime instance. Inlining it gives each
		// bundle its own `ssr_context`, which breaks lifecycle/context as soon as two bundles (or a
		// bundle and the driver) are loaded into the same process for an A/B comparison.
		rollupOptions: { external: [/^svelte($|\/)/] }
	}
});
