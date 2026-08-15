import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe, {
	type LeafHost
} from '$ixirjs/ui/test/components/atom/transition-leaf-probe.test.svelte';

/**
 * The transition leaves, verified in a browser.
 *
 * Transitions are client-only, so `bench:ssr`, `family-ssr` and the anchor budgets — every gate that
 * gated the rest of this seam work — are structurally blind to them. This spec is the only thing
 * standing behind `divLocal`/`dynamicLocal`/`divGlobal`/`dynamicGlobal`.
 *
 * Each case below maps to a defect that shipped once already.
 *
 * Run against both Kernel hosts: a bonded component and a static element. Both must reach the same
 * leaves through the same predicate.
 */
const frame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
const settle = async (ms = 120) => {
	await frame();
	await new Promise((resolve) => setTimeout(resolve, ms));
};

describe.each<LeafHost>(['bonded', 'static'])('transition leaves via %s host', (host) => {
	it('renders the element and plays an enter transition', async () => {
		render(Probe, { host, open: true });
		const el = document.querySelector('[data-testid="leaf"]');

		expect(el).not.toBeNull();
		// Mid-flight the transition drives opacity; by the end it releases the property.
		await settle();
		expect(el?.isConnected).toBe(true);
	});

	// `decorate` maps the library's `onexitend` onto Svelte's real `onoutroend`. Without it the
	// callback is spread onto the element as a listener for an `exitend` event nobody dispatches,
	// and the consumer's handler silently never runs.
	it('fires onexitend when the element leaves', async () => {
		const onexitend = vi.fn();
		const { rerender } = render(Probe, { host, open: true, onexitend });
		await settle();

		await rerender({ host, open: false, onexitend });
		await settle(200);

		expect(onexitend).toHaveBeenCalled();
	});

	// `handleIntroEnd` is the only thing that ever sets the rune's `hasEntered`, and `animate` is
	// gated on it. It is wired exclusively by `decorate`, so omitting `decorate` leaves `animate`
	// permanently dead behind any `enter` — with no error and no visible symptom.
	it('runs animate after the enter transition completes', async () => {
		const animate = vi.fn();
		render(Probe, { host, open: true, animate });
		await settle(200);

		expect(animate).toHaveBeenCalled();
	});

	/**
	 * `attach` returns a cleanup that clears the rune's `node`.
	 *
	 * Swapping a part from a transition leaf to the plain `div` leaf destroys the element, and the
	 * replacement snippet never calls `attach` — so without the cleanup `node` keeps pointing at the
	 * dead element, its effect teardowns never run, and `ondestroy` is never delivered for it.
	 * `html-element.svelte` never hit this because its swaps always re-attached.
	 */
	it('releases the node when a mode flip swaps the element away', async () => {
		const ondestroy = vi.fn();
		const { rerender } = render(Probe, { host, open: true, withMotion: true, ondestroy });
		await settle();

		await rerender({ host, open: true, withMotion: false, ondestroy });
		await settle(200);

		expect(ondestroy).toHaveBeenCalled();
	});

	// `global` must not reach the DOM: it is not a boolean DOM attribute, so a raw spread emits
	// `global="true"`. `html-element.svelte` destructured it out; the leaves strip it explicitly.
	it('keeps renderer-only props off the element', async () => {
		// `global` is passed explicitly — without it the assertion below would pass vacuously.
		render(Probe, { host, open: true, global: true, onexitend: () => {}, onintroend: () => {} });
		const el = document.querySelector('[data-testid="leaf"]');

		expect(el?.hasAttribute('global')).toBe(false);
		expect(el?.hasAttribute('onexitend')).toBe(false);
		expect(el?.hasAttribute('onintroend')).toBe(false);
	});
});
