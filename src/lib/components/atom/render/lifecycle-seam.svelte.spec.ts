import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createLifecycleKey } from './lifecycle.svelte';
import Fixture from '$ixirjs/ui/test/components/atom/lifecycle-seam-fixture.test.svelte';
import HtmlElement from '$ixirjs/ui/components/element/html-element.svelte';

/** Client lifecycle through Kernel's bonded leaf and custom-renderer branches. */
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

	it('fires the mount phase, and the destroy phase on teardown', async () => {
		const mountKey = createLifecycleKey('mount');
		const destroyKey = createLifecycleKey('destroy');
		let mounted = 0;
		let destroyed = 0;

		const { unmount } = render(Fixture, {
			lifecycleProps: {
				[mountKey]: () => void (mounted += 1),
				[destroyKey]: () => void (destroyed += 1)
			}
		});
		await settle();
		expect(mounted).toBe(1);

		unmount();
		await settle();
		expect(destroyed).toBe(1);
	});

	it('fires each hook exactly once when a base selects a custom renderer', async () => {
		const mountKey = createLifecycleKey('mount');
		let inits = 0;
		let mounted = 0;

		render(Fixture, {
			base: HtmlElement,
			oninit: () => void (inits += 1),
			lifecycleProps: { [mountKey]: () => void (mounted += 1) }
		});
		await settle();

		expect(inits).toBe(1);
		expect(mounted).toBe(1);
	});
});
