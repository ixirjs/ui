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
			'$svelte-atoms/core': 'src/lib',
			'$svelte-atoms/core/*': 'src/lib/*',
			'@svelte-atoms/core': 'src/lib',
			'@svelte-atoms/core/attachments/*': 'src/lib/attachments/*',
			'@svelte-atoms/core/components/*': 'src/lib/components/*',
			'@svelte-atoms/core/context': 'src/lib/context',
			'@svelte-atoms/core/context/*': 'src/lib/context/*',
			'@svelte-atoms/core/shared': 'src/lib/shared',
			'@svelte-atoms/core/shared/*': 'src/lib/shared/*',
			'@svelte-atoms/core/types': 'src/lib/types',
			'@svelte-atoms/core/types/*': 'src/lib/types/*',
			'@svelte-atoms/core/utils': 'src/lib/utils',
			'@svelte-atoms/core/utils/*': 'src/lib/utils/*',
			'@svelte-atoms/core/*': 'src/lib/components/*'
		}
	},
	extensions: ['.svelte', '.svx'],
	vitePlugin: {
		inspector: {}
	}
};

export default config;
