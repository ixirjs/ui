import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe from '$ixirjs/ui/test/components/atom/css-part-probe.test.svelte';

describe('Kernel CSS part attribute', () => {
	it('forwards a string `part` to the element as the CSS shadow-parts attribute', async () => {
		// `part` is a named render prop, but a string remains the CSS shadow-parts attribute.
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
