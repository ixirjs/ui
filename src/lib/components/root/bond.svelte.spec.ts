import { describe, expect, it } from 'vitest';
import { RootBond } from './bond.svelte';

describe('RootBond', () => {
	// This used to assert that a `renderers` prop round-tripped onto the Bond. That slot is gone:
	// its `html` entry was always the default `HtmlElement` and only served to push every part off
	// the native render seam, while `svg`/`mathml` were never read. Renderer selection is per
	// element via the `base` prop. See docs/research/root-renderer-slot-2026-08.md.
	it('creates the provider Bond with no element attached yet', () => {
		const bond = new RootBond({ extend: {} });

		expect(bond.rootElement).toBeUndefined();
	});
});
