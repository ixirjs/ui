import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Fixture from '$ixirjs/ui/test/components/drawer/drawer-portal-surface.test.svelte';
import LayerProbe from '$ixirjs/ui/test/components/drawer/drawer-preset-probe.test.svelte';
import type { DrawerBond } from './bond.svelte';

describe('Drawer.Root portal surface', () => {
	it('uses the explicit portal sink, preserves position/side props, and promotes reopened siblings', async () => {
		const { component, rerender, unmount } = render(Fixture);
		await tick();

		const sink = document.querySelector<HTMLElement>('[data-testid="drawer-local-sink"]')!;
		const first = document.querySelector<HTMLElement>('[data-testid="drawer-first"]')!;
		const second = document.querySelector<HTMLElement>('[data-testid="drawer-second"]')!;
		const fixture = component as unknown as { getFirstBond(): DrawerBond };

		expect(first.parentElement).toBe(sink);
		expect(second.parentElement).toBe(sink);
		expect(first.dataset.portal).toBe('local');
		expect(first.style.position).toBe('absolute');
		expect(Number(first.style.zIndex)).toBeLessThan(Number(second.style.zIndex));
		expect(fixture.getFirstBond().props.side).toBe('left');

		await rerender({ firstOpen: false });
		await tick();
		await rerender({ firstOpen: true });
		await tick();

		expect(Number(first.style.zIndex)).toBeGreaterThan(Number(second.style.zIndex));
		unmount();
	});

	it('applies root-owned layers to every bonded Drawer part', () => {
		const { unmount } = render(LayerProbe, {
			presets: {
				root: { class: 'instance-root', attrs: { 'data-instance': 'root' } },
				content: { class: 'instance-content', attrs: { 'data-instance': 'content' } },
				header: { class: 'instance-header', attrs: { 'data-instance': 'header' } },
				title: { class: 'instance-title', attrs: { 'data-instance': 'title' } },
				description: { class: 'instance-description', attrs: { 'data-instance': 'description' } },
				body: { class: 'instance-body', attrs: { 'data-instance': 'body' } },
				footer: { class: 'instance-footer', attrs: { 'data-instance': 'footer' } },
				backdrop: { class: 'instance-backdrop', attrs: { 'data-instance': 'backdrop' } }
			}
		});

		expect(document.querySelector('[data-instance="root"]')?.hasAttribute('presets')).toBe(false);

		for (const value of [
			'root',
			'content',
			'header',
			'title',
			'description',
			'body',
			'footer',
			'backdrop'
		]) {
			expect(document.querySelector(`[data-instance="${value}"]`), value).not.toBeNull();
		}

		unmount();
	});
});
