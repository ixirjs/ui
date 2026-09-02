import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Fixture from '$ixirjs/ui/test/components/atom/lifecycle-seam-fixture.test.svelte';
import StaticFastPathProbe from '$ixirjs/ui/test/components/atom/static-fast-path-probe.test.svelte';

/**
 * Client lifecycle through Kernel's bonded leaf.
 *
 * The symbol-keyed `mount`/`destroy` keys this also covered went with the old runtime on
 * 2026-08-27: they never survived server `rest_props`, no first-party part used them, and the
 * redesigned Kernel keeps one init hook — `oninit` — which works on both platforms.
 */
const settle = () => new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

describe('bond lifecycle through Kernel', () => {
	it('fires oninit once and runs its cleanup on teardown', async () => {
		let inits = 0;
		let cleanups = 0;
		const oninit = () => {
			inits += 1;
			return () => {
				cleanups += 1;
			};
		};

		const { unmount } = render(Fixture, { oninit });
		await settle();
		expect(inits).toBe(1);
		expect(cleanups).toBe(0);

		unmount();
		await settle();
		expect(cleanups).toBe(1);
	});

	// L1's static fast path (`kernel.svelte.ts`) resolves a class-only preset entry (no variants, no
	// layer) via the cached `staticRecordValue`/`staticBase` — `oninit` must still fire exactly once
	// through that branch, since the classification only changes how attrs resolve, never lifecycle.
	it('fires oninit once on a static preset entry', async () => {
		let inits = 0;
		const oninit = () => {
			inits += 1;
		};

		render(StaticFastPathProbe, { oninit } as never);
		await settle();
		expect(inits).toBe(1);
	});
});
