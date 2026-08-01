import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { tick } from 'svelte';
import Probe from '$ixirjs/ui/test/components/collapsible/collapsible-motion-probe.test.svelte';

/**
 * The body's open/close motion is an attachment, not a `defaults` motion phase, so the part stays
 * on `HtmlAtom`'s native renderer instead of the `HtmlElement` adapter. These tests pin the two
 * properties that migration had to preserve, because nothing else would catch their loss: the
 * motion still runs at mount, and it still re-runs when the disclosure state changes.
 */
describe('Collapsible body motion', () => {
	it('applies the closed initial state at mount', async () => {
		const screen = render(Probe, { open: false });
		const body = screen.container.querySelector('[data-testid="body"]') as HTMLElement;

		await tick();
		// `initial` runs with duration 0, which commits final styles synchronously.
		expect(body.style.height).toBe('0px');
		expect(body.style.opacity).toBe('0');
	});

	it('re-runs when the disclosure opens', async () => {
		const screen = render(Probe, { open: false });
		const body = screen.container.querySelector('[data-testid="body"]') as HTMLElement;
		await tick();
		expect(body.style.opacity).toBe('0');

		const animateSpy = vi.spyOn(body, 'animate');
		screen.rerender({ open: true });
		await tick();

		// The attachment reads `bond.isOpen`, so opening re-invokes it and starts a real animation
		// toward the open state rather than leaving the collapsed styles in place.
		expect(animateSpy).toHaveBeenCalled();
		const keyframes = animateSpy.mock.calls[0]?.[0] as Record<string, unknown>;
		expect(keyframes.opacity).toEqual(['0', '1']);
	});

	it('cancels a superseded run rather than stacking animations on the element', async () => {
		const screen = render(Probe, { open: false });
		const body = screen.container.querySelector('[data-testid="body"]') as HTMLElement;
		await tick();

		// Interrupt each run before it can settle. The attachment's cleanup cancels the previous
		// controller, so only the newest animation is ever live; without it every toggle leaves
		// another filled WAAPI animation attached to the element.
		for (const open of [true, false, true, false]) {
			screen.rerender({ open });
			await tick();
		}

		expect(body.getAnimations().length).toBeLessThanOrEqual(1);
	});
});
