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
			'@ixirjs/ui': 'src/lib'
		}
	},
	extensions: ['.svelte', '.svx'],
	vitePlugin: {
		inspector: {}
	}
};

export default config;
