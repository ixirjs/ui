import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Fixture from '$ixirjs/ui/test/components/popover-dialog/popover-dialog-repeated-header.test.svelte';

// Was asserted through `nodesByPart('header')`; the fusion registers no nodes now, so the same
// behaviour — a repeated layout part is not collapsed to one, and every instance goes away with the
// tree — is asserted on the DOM.
describe('PopoverDialog layout parts', () => {
	it('renders every repeated header and body, and releases them on unmount', () => {
		const { unmount } = render(Fixture);

		const headers = document.querySelectorAll('[data-testid="popover-dialog-header"]');
		const bodies = document.querySelectorAll('[data-testid="popover-dialog-body"]');
		expect(headers).toHaveLength(2);
		expect(bodies).toHaveLength(2);
		expect([...headers].map((node) => node.textContent)).toEqual([
			'Primary heading',
			'Secondary heading'
		]);
		expect([...bodies].map((node) => node.textContent)).toEqual(['First body', 'Second body']);

		unmount();
		expect(document.querySelectorAll('[data-testid="popover-dialog-header"]')).toHaveLength(0);
		expect(document.querySelectorAll('[data-testid="popover-dialog-body"]')).toHaveLength(0);
	});

	/**
	 * Ids derive from the family's seed, so a repeated part has to claim its own or the document
	 * carries duplicates — invalid HTML, and `aria-labelledby` then resolves by document order
	 * rather than by intent. The first instance keeps the canonical id (every cross-part reference
	 * already points at it); later ones take the lowest free suffix, released on unmount.
	 */
	it('gives every repeated instance its own id, the first keeping the canonical one', () => {
		const { unmount } = render(Fixture);

		const ids = (testid: string) =>
			[...document.querySelectorAll(`[data-testid="${testid}"]`)].map((node) => node.id);
		const headers = ids('popover-dialog-header');
		const bodies = ids('popover-dialog-body');

		expect(new Set(headers).size).toBe(headers.length);
		expect(new Set(bodies).size).toBe(bodies.length);
		expect(headers[0]).toMatch(/^popover-dialog-header-/);
		expect(headers[1]).toBe(`${headers[0]}-2`);

		unmount();
	});
});
