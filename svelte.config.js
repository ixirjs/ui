import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess(), mdsvex()],
	kit: {
		adapter: adapter({
			split: false,
			edge: false
		}),
		alias: {
			$docs: 'src/docs',
			'$docs/*': 'src/docs/*',
			'$ixirjs/ui': 'src/lib',
			'$ixirjs/ui/*': 'src/lib/*',
			// The published entry points must precede the catch-all: Vite resolves aliases in order,
			// so `'@ixirjs/ui': 'src/lib'` listed first made `@ixirjs/ui/shared` resolve to the
			// internal barrel at runtime while TypeScript resolved it to `public/shared.ts`.
			'@ixirjs/ui/preset': 'src/lib/preset',
			'@ixirjs/ui/shared': 'src/lib/public/shared',
			'@ixirjs/ui/experimental': 'src/lib/public/experimental',
			'@ixirjs/ui/utils': 'src/lib/public/utils',
			'@ixirjs/ui/components/*': 'src/lib/public/components/*',
			'@ixirjs/ui': 'src/lib',
			// Vendored shadcn-svelte source, used only by the head-to-head bench fixtures under
			// `src/lib/test/perf/vs-shadcn/`. Declared here so `svelte-check` resolves the same
			// specifier the two bench Vite configs already alias; nothing in `src/lib` imports it.
			'$shadcn/*': 'bench/vs-shadcn/*'
		}
	},
	extensions: ['.svelte', '.svx'],
	vitePlugin: {
		inspector: {}
	}
};

export default config;
