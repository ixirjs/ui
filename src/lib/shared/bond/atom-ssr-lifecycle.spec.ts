import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import Fixture from '$ixirjs/ui/test/shared/bond/atom-ssr-lifecycle.test.svelte';
import { Bond } from './bond.svelte';

class SsrBond extends Bond {
	constructor() {
		super({}, 'ssr-probe');
	}
}

describe('createAtomInstance — SSR lifecycle', () => {
	it('skips client effects and unregisters every atom across repeated server renders', () => {
		const events: string[] = [];
		const bond = new SsrBond();

		for (let pass = 0; pass < 2; pass++) {
			const { body } = render(Fixture, { props: { bond, events } });
			expect(body).toContain('probe');
			expect(events).toEqual([]);
			// Svelte runs onDestroy during SSR; createAtomInstance removes the complete render batch.
			expect(bond.nodeByPart('probe')).toBeUndefined();
			expect(bond.nodeByPart('sibling')).toBeUndefined();
		}
	});
});
