import { tick } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe from './component-composition-probe.test.svelte';

type ProbeHandle = {
	bonds(): {
		dialog?: { isOpen: boolean; close(): void };
		nested?: { isOpen: boolean; close(): void };
		first?: { isOpen: boolean };
		second?: { isOpen: boolean };
	};
};

async function settle() {
	await tick();
	await Promise.resolve();
	await tick();
}

describe('component composition contract', () => {
	afterEach(() => vi.restoreAllMocks());

	it('keeps a nested popover in its dialog portal host', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const { unmount } = render(Probe);
		await settle();

		const surfaces = Array.from(document.querySelectorAll<HTMLElement>('[data-portal]'));
		const dialogSurface = surfaces.find((surface) => surface.dataset.band === 'modal');
		const nestedSurface = surfaces.find(
			(surface) =>
				surface.dataset.band === 'positioned' &&
				surface.dataset.portal?.startsWith('dialog-content-')
		);

		expect(dialogSurface?.dataset.portal).toBe('root.l0');
		expect(nestedSurface).toBeDefined();
		expect(nestedSurface?.dataset.portal).not.toBe('root.l0');
		expect(warn).not.toHaveBeenCalled();
		unmount();
	});

	it('keeps a drawer-hosted select in the drawer portal host', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const { unmount } = render(Probe);
		await settle();

		const selectSurface = Array.from(document.querySelectorAll<HTMLElement>('[data-portal]')).find(
			(surface) =>
				surface.dataset.band === 'positioned' && surface.dataset.portal?.startsWith('portal-host.')
		);
		expect(selectSurface).toBeDefined();
		expect(selectSurface?.dataset.portal).not.toBe('root.l0');
		expect(warn).not.toHaveBeenCalled();
		unmount();
	});

	it('ranks same-band root popovers by enrollment order', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const { unmount } = render(Probe);
		await settle();

		const rootSurfaces = Array.from(
			document.querySelectorAll<HTMLElement>('[data-band="positioned"][data-portal="root.l0"]')
		);
		expect(rootSurfaces).toHaveLength(2);
		expect(rootSurfaces.map((surface) => surface.style.zIndex)).toEqual(['11', '12']);
		expect(warn).not.toHaveBeenCalled();
		unmount();
	});

	it('closes the nested disclosure without changing its dialog host', async () => {
		const { component, unmount } = render(Probe);
		await settle();
		const { dialog, nested } = (component as unknown as ProbeHandle).bonds();

		nested?.close();
		expect(nested?.isOpen).toBe(false);
		expect(dialog?.isOpen).toBe(true);
		unmount();
	});
});
