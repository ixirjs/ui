import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	// Per-checkout, not under node_modules: worktrees that share a node_modules symlink would
	// otherwise fight over one dependency cache and fail each other's runs mid-scan.
	cacheDir: '.vite-cache',
	server: {
		// Agent worktrees live under `.claude/worktrees`; a watcher that sees them force-reloads the
		// dev server (and a running vitest) every time one of them writes a file.
		watch: { ignored: ['**/.claude/**', '**/.vite-cache/**'] }
	},
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
