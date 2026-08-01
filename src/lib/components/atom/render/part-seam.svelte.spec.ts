import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe from '$ixirjs/ui/test/components/atom/part-seam-probe.test.svelte';

describe('HtmlAtom — the `part` prop is overloaded', () => {
	it('forwards a string `part` to the element as the CSS shadow-parts attribute', async () => {
		// The direct-part seam took the `part` name, which HTMLAttributes already declares. Consumers
		// styling through `::part()` must still be able to set it, so HtmlAtom discriminates by type
		// and hands the string branch back to the element untouched.
		render(Probe, { part: 'card' });

		const el = document.querySelector('[data-testid="seam"]');
		expect(el?.getAttribute('part')).toBe('card');
	});

	it('emits no `part` attribute when the prop is absent', async () => {
		render(Probe, {});

		const el = document.querySelector('[data-testid="seam"]');
		expect(el?.hasAttribute('part')).toBe(false);
	});
});
