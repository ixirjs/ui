import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { tick } from 'svelte';
import Probe from '$ixirjs/ui/test/components/tree/tree-motion-probe.test.svelte';

/**
 * Tree's body and indicator both carry their open/close motion as attachments rather than
 * `defaults` motion phases, so neither part is routed through the `HtmlElement` adapter. A node has
 * two such parts, which is why this family gained the most from the change. These tests pin what
 * the migration had to preserve, since nothing else would catch its loss.
 */
describe('Tree node motion', () => {
	const parts = (screen: { container: HTMLElement }) => ({
		body: screen.container.querySelector('[data-testid="body"]') as HTMLElement,
		indicator: screen.container.querySelector('[data-testid="indicator"]') as HTMLElement
	});

	it('applies the closed initial state to the body at mount', async () => {
		const screen = render(Probe, { open: false });
		const { body } = parts(screen);

		await tick();
		// `initial` runs with duration 0, which commits final styles synchronously.
		expect(body.style.height).toBe('0px');
		expect(body.style.opacity).toBe('0');
	});

	it('re-runs the body motion when the node expands', async () => {
		const screen = render(Probe, { open: false });
		const { body } = parts(screen);
		await tick();

		const animateSpy = vi.spyOn(body, 'animate');
		screen.rerender({ open: true });
		await tick();

		expect(animateSpy).toHaveBeenCalled();
		const keyframes = animateSpy.mock.calls[0]?.[0] as Record<string, unknown>;
		expect(keyframes.opacity).toEqual(['0', '1']);
	});

	it('re-runs the indicator rotation when the node expands', async () => {
		const screen = render(Probe, { open: false });
		const { indicator } = parts(screen);
		await tick();

		const animateSpy = vi.spyOn(indicator, 'animate');
		screen.rerender({ open: true });
		await tick();

		// The indicator declares no `initial`, so the rotation is driven purely by re-invocation.
		expect(animateSpy).toHaveBeenCalled();
	});

	it('cancels superseded runs rather than stacking animations on either part', async () => {
		const screen = render(Probe, { open: false });
		const { body, indicator } = parts(screen);
		await tick();

		for (const open of [true, false, true, false]) {
			screen.rerender({ open });
			await tick();
		}

		expect(body.getAnimations().length).toBeLessThanOrEqual(1);
		expect(indicator.getAnimations().length).toBeLessThanOrEqual(1);
	});
});
