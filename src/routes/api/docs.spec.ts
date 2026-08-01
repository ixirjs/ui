import { describe, expect, it } from 'vitest';
import { componentSlugs, docSlugs, guideSlugs, readDoc, slugOf } from './docs';

// The MCP server used to reach its docs by fetching its own origin and by readdir-ing
// `process.cwd()` — both of which silently returned nothing in a built deploy. These
// assertions fail if the glob-based replacement stops resolving the doc set.

describe('mcp doc source', () => {
	it('maps an llms.txt route path to its slug', () => {
		expect(slugOf('/src/routes/docs/components/button/llms.txt/+server.ts')).toBe(
			'components/button'
		);
		expect(slugOf('/src/routes/docs/preset/llms.txt/+server.ts')).toBe('preset');
		expect(slugOf('/src/routes/docs/llms.txt/+server.ts')).toBe('index');
	});

	it('discovers both guides and components', () => {
		expect(docSlugs.length).toBeGreaterThan(20);
		expect(guideSlugs).toContain('crafting');
		expect(componentSlugs).toContain('button');
		expect(guideSlugs.length + componentSlugs.length).toBe(docSlugs.length);
	});

	// Rendering a component doc pulls in the whole library plus shiki; slow under suite contention.
	it('renders a doc through its own route handler', { timeout: 30_000 }, async () => {
		const content = await readDoc('components/button');
		expect(content).toBeTruthy();
		expect(content!.length).toBeGreaterThan(0);
	});

	it('returns null for an unknown slug rather than throwing', async () => {
		await expect(readDoc('no-such-doc')).resolves.toBeNull();
	});
});
