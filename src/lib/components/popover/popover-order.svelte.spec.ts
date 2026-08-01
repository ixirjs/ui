import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import OrderProbe from '$ixirjs/ui/test/components/popover/popover-order-probe.test.svelte';
import NestedLayerProbe from '$ixirjs/ui/test/components/popover/popover-nested-layer-probe.test.svelte';

describe('Popover order', () => {
	it('passes anchor-relative order into the overlay layer', async () => {
		const { unmount } = render(OrderProbe);

		const overlay = document.querySelector<HTMLElement>('.pointer-events-none[style*="z-index"]');
		expect(overlay).not.toBeNull();
		expect(overlay?.style.zIndex).toBe('4');

		unmount();
	});

	it('uses the portal-owned positioned elevation instead of a legacy parent layer', () => {
		const { unmount } = render(NestedLayerProbe);

		const overlay = document.querySelector<HTMLElement>('.pointer-events-none[style*="z-index"]');
		expect(overlay).not.toBeNull();
		expect(overlay?.style.zIndex).toBe('11');

		unmount();
	});
});
