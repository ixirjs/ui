import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe from '$ixirjs/ui/test/components/atom/custom-renderer-probe.test.svelte';
import PresetRendererProbe from '$ixirjs/ui/test/components/atom/preset-renderer-probe.test.svelte';

describe('Kernel custom render target', () => {
	it('does not hand HtmlElement-private props to a consumer-supplied base component', async () => {
		render(Probe, { received: [] });
		const el = document.querySelector('[data-testid="custom"]');

		// `__presentationResolved` is private to Kernel's HtmlElement leaf. A `base` naming some other
		// component resolves its own presentation, so it must
		// never see the flag — and must never spread it onto the DOM as an unknown attribute.
		//
		// Read off `data-received` rather than the probe's array: an array-valued prop is copied on its
		// way through the resolve pipeline, so the renderer's pushes land somewhere this spec cannot
		// see and every assertion against that array passed on an empty list. Assert it is non-empty
		// first — that is what keeps this from going quiet again.
		const received = el?.getAttribute('data-received')?.split(',') ?? [];
		expect(received.length).toBeGreaterThan(0);
		expect(received).not.toContain('__presentationResolved');
		expect(document.querySelector('[__resolvedpresentation]')).toBeNull();
	});

	/**
	 * A renderer named by the preset, not by the call site.
	 *
	 * `presentation.svelte.ts` resolves `base` as `values.base ?? preset?.render?.base`, so an atom
	 * with no `base` prop can still owe a component. The dispatch has to ask the PRESENTATION that
	 * question; asking the destructured prop gets `undefined` and routes the atom to the plain `div`
	 * leaf instead.
	 *
	 * That failure is invisible by inspection — the preset's classes still resolve and still land, so
	 * the element looks right and simply is not the component the preset asked for. Nothing else in
	 * the suite covers it: the case above supplies `base` explicitly, which the prop path also finds.
	 *
	 * The renderer renders a `<div>` too, so the element alone proves nothing. `data-received` is what
	 * separates the paths — only the renderer emits it. The class no longer discriminates: the
	 * redesigned Kernel resolves through `withDefaultBorder` once, before the dispatch, so a renderer
	 * receives the same `border-border …` string a leaf would (2026-08-27).
	 */
	it('mounts a renderer that only the preset names', async () => {
		render(PresetRendererProbe, { received: [] });
		const el = document.querySelector('[data-testid="preset-renderer"]');

		expect(el?.getAttribute('data-received')).toBeTruthy();
		expect(el?.className).toContain('from-preset');
	});
});
