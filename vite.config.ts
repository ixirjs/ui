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
		// Vite's dependency scanner cannot follow Svelte snippet exports: it sees only the
		// component's HTML virtual module, not the exports emitted by the Svelte compiler.
		// The browser dependencies we want pre-bundled are already explicit below.
		noDiscovery: true,
		include: ['clsx', 'tailwind-merge', 'es-toolkit', 'date-fns']
	}
});
