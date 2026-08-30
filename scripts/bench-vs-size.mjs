/**
 * Shipped-JS axis of the head-to-head. Run with `bun run bench:vs-shadcn:size`.
 *
 * Bundles the same five families from each library into a minified, tree-shaken, Svelte-excluded
 * client bundle and reports raw / gzip / brotli bytes. Svelte itself is external on both sides: it
 * ships once per app regardless of which library is on top, so including it would add the same
 * ~100 kB to both columns and shrink the difference actually being measured.
 *
 * shadcn-svelte's accordion and dropdown-menu pull in bits-ui, which is where its weight is; card,
 * button and table are vendored source and weigh almost nothing. Ours is one package throughout.
 */
import { build } from 'vite';
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { gzipSync, brotliCompressSync, constants } from 'node:zlib';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const lib = join(root, 'src/lib');

async function bundle(side) {
	const outDir = join(root, `.bench-out/size-${side}`);
	await build({
		root,
		// `configFile: false` or vite loads the app's own SvelteKit config and bundles the docs site.
		configFile: false,
		logLevel: 'error',
		plugins: [svelte({ preprocess: [vitePreprocess()] })],
		resolve: {
			alias: [
				{ find: /^\$ixirjs\/ui$/, replacement: lib },
				{ find: /^\$ixirjs\/ui\//, replacement: lib + '/' },
				{ find: /^\$lib\//, replacement: lib + '/' },
				{ find: /^\$app\/environment$/, replacement: join(lib, 'test/perf/app-environment.ts') },
				{ find: /^\$shadcn\//, replacement: join(root, 'bench/vs-shadcn') + '/' }
			]
		},
		build: {
			outDir,
			emptyOutDir: true,
			minify: 'esbuild',
			target: 'esnext',
			sourcemap: false,
			lib: {
				entry: join(lib, `test/perf/vs-shadcn/size-${side}.ts`),
				formats: ['es'],
				fileName: () => 'slice.js'
			},
			rollupOptions: {
				external: [
					// Svelte ships once per app on either side; counting it twice hides the delta.
					/^svelte($|\/)/,
					// shadcn's accordion trigger and menu items import individual `@lucide/svelte`
					// icons, which are not installed here. Externalised rather than vendored: icons are
					// a per-app choice on both sides (ours are inline SVG components the consumer can
					// replace via `<Icon src>`), so bundling one side's icon set and not the other's
					// would measure the icons. This understates the shadcn column by a few hundred
					// bytes per icon.
					/^@lucide\/svelte($|\/)/
				]
			}
		}
	});
	const code = readFileSync(join(outDir, 'slice.js'));
	const css = readdirSync(outDir)
		.filter((file) => file.endsWith('.css'))
		.reduce((sum, file) => sum + readFileSync(join(outDir, file)).length, 0);
	return {
		raw: code.length,
		gzip: gzipSync(code, { level: 9 }).length,
		brotli: brotliCompressSync(code, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).length,
		css
	};
}

const ixir = await bundle('ixir');
const shadcn = await bundle('shadcn');

const kb = (n) => `${(n / 1024).toFixed(1)} kB`.padStart(9);
const pct = (a, b) => `${a > b ? '+' : ''}${(((a - b) / b) * 100).toFixed(0)}%`.padStart(9);

console.log(
	'\nShipped JS for the same five families — card, button, accordion, menu, table/datagrid\n' +
		'  (svelte external on both sides; it ships once per app either way)\n'
);
console.log('  side          raw       gzip     brotli        css');
console.log(`  ixir     ${kb(ixir.raw)}  ${kb(ixir.gzip)}  ${kb(ixir.brotli)}  ${kb(ixir.css)}`);
console.log(
	`  shadcn   ${kb(shadcn.raw)}  ${kb(shadcn.gzip)}  ${kb(shadcn.brotli)}  ${kb(shadcn.css)}`
);
console.log(
	`  vs       ${pct(ixir.raw, shadcn.raw)}  ${pct(ixir.gzip, shadcn.gzip)}  ${pct(ixir.brotli, shadcn.brotli)}\n`
);
