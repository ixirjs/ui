import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		expect: { requireAssertions: true },
		globals: true,
		projects: [
			{
				extends: './vite.config.ts',
				// Dependency discovery is disabled in Vite; browser tests also need these CJS trees bundled.
				optimizeDeps: {
					include: ['@testing-library/svelte', '@testing-library/jest-dom/vitest']
				},
				test: {
					name: 'client',
					environment: 'browser',
					browser: {
						enabled: true,
						provider: 'playwright',
						instances: [{ browser: 'chromium' }],
						headless: true
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
					setupFiles: ['./vitest-setup-client.ts']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}', 'scripts/**/*.spec.mjs'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
