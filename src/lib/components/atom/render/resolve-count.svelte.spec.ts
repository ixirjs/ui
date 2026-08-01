import { page } from '@vitest/browser/context';
import { render } from 'vitest-browser-svelte';
import { beforeEach, describe, expect, it } from 'vitest';
import ResolveCount, { counter } from '$ixirjs/ui/test/components/atom/resolve-count.test.svelte';

/**
 * Client-side recompute cost of the presentation snapshot — the axis `bench:ssr` cannot see, because
 * the server path bypasses the signal entirely (`presentation.svelte.ts` server fast path).
 *
 * `createPresentation` wraps the whole resolve — preset lookup, variant merge, fold, class merge — in
 * one `$derived.by`, deliberately, so a part owns one signal instead of six. The cost of that trade
 * is that any tracked read invalidates all of it. A preset factory runs exactly once per resolve, so
 * counting its calls counts recomputes with no timing noise and no machine dependence — a wall-clock
 * browser benchmark cannot resolve a single recompute, and this can.
 */
describe('presentation recompute count', () => {
	beforeEach(() => {
		counter.bare = 0;
		counter.withAttrs = 0;
	});

	it('resolves once per rendered part on mount', async () => {
		render(ResolveCount);
		await expect.element(page.getByTestId('bare')).toHaveClass(/counted-bare/);
		await expect.element(page.getByTestId('with-attrs')).toHaveClass(/counted-attrs/);

		expect(counter.bare).toBe(1);
		expect(counter.withAttrs).toBe(1);
	});

	/**
	 * The passthrough in `foldPresentationAttrs` is not only an allocation win. With no layer to fold
	 * and no motion key to strip it returns `rest` by reference, so the template spreads the live
	 * rest-props proxy and reads its keys OUTSIDE the derived — an unrelated attribute change updates
	 * the element without re-resolving preset, variants, or classes at all.
	 */
	it('does not re-resolve at all when the fold passthrough applies', async () => {
		render(ResolveCount);
		await expect.element(page.getByTestId('bare')).toHaveClass(/counted-bare/);
		const mounted = counter.bare;

		await page.getByTestId('flip-title').click();
		await expect.element(page.getByTestId('bare')).toHaveAttribute('title', 'b');
		await page.getByTestId('flip-hidden').click();
		await expect.element(page.getByTestId('bare')).toHaveAttribute('aria-hidden', 'true');

		expect(counter.bare - mounted).toBe(0);
	});

	/**
	 * A preset that declares `attrs` forces the copy path, which reads every rest key inside the
	 * tracked boundary — so one unrelated attribute change re-runs the entire resolve. This is the
	 * real client-side cost of the single-signal trade, and it is the shape every shipped component
	 * with preset attrs takes. Pinned rather than optimised: splitting the class axis out of the
	 * snapshot would cut it, but it costs a part its single signal and no profile has asked for it.
	 */
	it('re-resolves the whole snapshot once per change when the fold must copy', async () => {
		render(ResolveCount);
		await expect.element(page.getByTestId('with-attrs')).toHaveClass(/counted-attrs/);
		const mounted = counter.withAttrs;

		await page.getByTestId('flip-title').click();
		await expect.element(page.getByTestId('with-attrs')).toHaveAttribute('title', 'b');

		expect(counter.withAttrs - mounted).toBe(1);
	});

	it('does not compound across independent changes', async () => {
		render(ResolveCount);
		await expect.element(page.getByTestId('with-attrs')).toHaveClass(/counted-attrs/);
		const mounted = counter.withAttrs;

		await page.getByTestId('flip-title').click();
		await page.getByTestId('flip-hidden').click();
		await expect.element(page.getByTestId('with-attrs')).toHaveAttribute('aria-hidden', 'true');

		// Two changes, two recomputes. A per-attribute fanout or quadratic regression shows up here.
		expect(counter.withAttrs - mounted).toBe(2);
	});
});
