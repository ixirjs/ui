import { createRawSnippet, tick, type Component } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type {
	PortalBond,
	PortalElevationEntry
} from '$ixirjs/ui/components/portal/instance/bond.svelte';
import type { OverlayLike } from '$ixirjs/ui/components/overlay';
import type { PortalSurfaceChildren, PortalSurfaceProps } from '$ixirjs/ui/components/portal/types';
import {
	PortalsContext,
	type PortalsBond as PortalsBondView
} from '$ixirjs/ui/components/portal/registry';
import PortalSurface from './portal-surface.svelte';
import Probe from '$ixirjs/ui/test/components/portal/portal-surface-probe.test.svelte';

const TestPortalSurface = PortalSurface as unknown as Component<PortalSurfaceProps>;

function portalTarget(
	id: string,
	sink: HTMLElement,
	boundary = sink,
	elevation: (entry: PortalElevationEntry) => number = () => 30
): PortalBond {
	const portal = {
		props: { id },
		get sinkElement() {
			return sink;
		},
		get boundaryElement() {
			return boundary;
		},
		elevation,
		share: () => portal
	};
	return portal as unknown as PortalBond;
}

function portalRegistry(root: PortalBond): PortalsBondView {
	return {
		getPortal: (id: string) => (id === 'root.l0' ? root : undefined)
	} as unknown as PortalsBondView;
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe('PortalSurface', () => {
	it('ports banded content through the portal elevation seam', () => {
		const { unmount } = render(Probe);
		const surface = document.querySelector<HTMLElement>('.surface-probe');

		expect(surface).not.toBeNull();
		expect(surface?.dataset.band).toBe('ambient');
		expect(surface?.dataset.portal).toBe('root.l0');
		expect(surface?.style.zIndex).toBe('30');
		expect(surface?.style.getPropertyValue('--ixir-z').trim()).toBe('30');

		unmount();
	});

	it('ports into the sink and keeps portal-owned elevation consistent across style, data, and snippet', () => {
		const boundary = document.createElement('div');
		const sink = document.createElement('div');
		boundary.append(sink);
		document.body.append(boundary);
		const portal = portalTarget('local', sink, boundary);
		let snippetZ: number | undefined;
		const children: PortalSurfaceChildren = createRawSnippet<
			[{ portal: PortalBond; z: number | undefined }]
		>((getContext) => ({
			render: () => {
				snippetZ = getContext().z;
				return '<span class="surface-snippet"></span>';
			}
		}));

		const { unmount } = render(TestPortalSurface, {
			portal,
			band: 'ambient',
			children,
			class: 'owned-surface',
			style: 'z-index: 999; --ixir-z: 999',
			'data-band': 'consumer-band',
			'data-portal': 'consumer-portal'
		});
		const surface = sink.querySelector<HTMLElement>('.owned-surface');

		expect(surface).not.toBeNull();
		expect(boundary.querySelector(':scope > .owned-surface')).toBeNull();
		expect(surface?.style.zIndex).toBe('30');
		expect(surface?.style.getPropertyValue('--ixir-z').trim()).toBe('30');
		expect(surface?.dataset.band).toBe('ambient');
		expect(surface?.dataset.portal).toBe('local');
		expect(snippetZ).toBe(30);

		unmount();
		boundary.remove();
	});

	it('does not retain rank when the enrollment identity changes', async () => {
		const sink = document.createElement('div');
		document.body.append(sink);
		const portal = portalTarget('local', sink, sink, (entry) => 30 + (entry.rank ?? 0));
		const first = { isOpen: true } as OverlayLike;
		const replacement = { isOpen: false } as OverlayLike;
		const portals = {
			rankOf: (owner: OverlayLike) => (owner.isOpen ? 2 : 0),
			enrollOverlay: () => () => undefined
		} as unknown as PortalsBondView;
		const { rerender, unmount } = render(TestPortalSurface, {
			props: { portal, owner: first, band: 'ambient', class: 'ranked-surface' },
			context: new Map([[PortalsContext.key, portals]])
		});
		await tick();
		const surface = sink.querySelector<HTMLElement>('.ranked-surface');
		expect(surface?.style.zIndex).toBe('32');

		await rerender({ owner: replacement });
		expect(surface?.style.zIndex).toBe('30');

		unmount();
		sink.remove();
	});

	it('warns for an unresolved explicit target even when the root fallback is used', async () => {
		const sink = document.createElement('div');
		document.body.append(sink);
		const root = portalTarget('root.l0', sink);
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const { unmount } = render(TestPortalSurface, {
			props: { portal: 'missing', class: 'fallback-surface' },
			context: new Map([[PortalsContext.key, portalRegistry(root)]])
		});
		await tick();

		expect(sink.querySelector('.fallback-surface')).not.toBeNull();
		expect(warn).toHaveBeenCalledWith(
			expect.stringContaining('explicit portal target did not resolve')
		);

		unmount();
		sink.remove();
	});
});
