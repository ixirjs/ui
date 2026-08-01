import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import Probe from '$ixirjs/ui/test/components/collapsible/ssr-identity-probe.test.svelte';

// Bond identity seeds from `$props.id()` (see bindBond's `id` option), so server render is
// reproducible and hydration adopts the server's ids instead of minting fresh ones. Before this,
// the seed was a random nanoid and every render produced different ids.
describe('bond identity — SSR determinism', () => {
	it('renders byte-identical markup across independent renders', () => {
		expect(render(Probe).body).toBe(render(Probe).body);
	});

	it('derives cross-slot ARIA from the shared seed, not from randomness', () => {
		const body = render(Probe).body;
		const headerIds = [...body.matchAll(/id="(collapsible-header-[^"]+)"/g)].map((m) => m[1]);
		const labelledBy = [...body.matchAll(/aria-labelledby="([^"]+)"/g)].map((m) => m[1]);

		expect(headerIds.length).toBe(2);
		expect(labelledBy).toEqual(headerIds);
	});

	it('keeps a consumer-supplied id on the element it was passed to', () => {
		expect(render(Probe).body).toContain('id="explicit-id"');
	});

	it('does not leak the identity seed into the DOM as a bare id', () => {
		const body = render(Probe).body;
		// `$props.id()` emits `s1`, `s2`, … — those must only appear as a suffix of a derived id
		// (`collapsible-root-s1`), never as a standalone `id="s1"`.
		expect(body).not.toMatch(/id="s\d+"/);
	});
});
