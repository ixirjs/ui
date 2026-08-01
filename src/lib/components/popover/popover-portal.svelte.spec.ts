import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe from '$ixirjs/ui/test/components/popover/popover-explicit-portal-probe.test.svelte';

describe('Popover explicit portal', () => {
	it('ports the overlay into the explicit sink and clips against that same sink', async () => {
		const { unmount } = render(Probe);
		await tick();
		await Promise.resolve();
		await tick();

		const sink = document.querySelector<HTMLElement>('.explicit-portal-sink');
		const overlay = sink?.querySelector<HTMLElement>(
			'.pointer-events-none[data-portal="explicit"]'
		);
		expect(overlay).not.toBeNull();
		expect(overlay?.parentElement).toBe(sink);

		// The trigger is outside the 1px explicit sink. hide() must use that resolved sink,
		// rather than the ambient portal/viewport, and mark the reference as hidden.
		expect(overlay?.style.opacity).toBe('0');

		unmount();
	});
});
