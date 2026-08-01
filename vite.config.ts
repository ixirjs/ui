import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), devtoolsJson()],
	build: {
		target: 'esnext',
		minify: 'esbuild',
		sourcemap: true,
		reportCompressedSize: false
	},
	optimizeDeps: {
		include: ['clsx', 'tailwind-merge', 'es-toolkit', 'date-fns']
	}
});
