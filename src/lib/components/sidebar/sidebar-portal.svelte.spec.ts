import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PortalFixture from '$ixirjs/ui/test/components/sidebar/sidebar-portal.test.svelte';

describe('Sidebar overlay portal surface', () => {
	it('ports the modal surface into its target with portal-owned elevation', async () => {
		const { unmount } = render(PortalFixture);
		await tick();
		const surface = document.querySelector<HTMLElement>('.sidebar-portal-probe')?.parentElement;

		expect(surface?.dataset.band).toBe('modal');
		expect(surface?.dataset.portal).toBe('root.l0');
		expect(surface?.style.zIndex).toBe('21');

		unmount();
	});
});
