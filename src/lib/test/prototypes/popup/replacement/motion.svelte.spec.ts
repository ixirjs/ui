import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Fixture from '$ixirjs/ui/test/prototypes/popup/replacement/motion.test.svelte';
import HtmlElement from '$ixirjs/ui/components/element/html-element.svelte';
import { componentBase } from '$ixirjs/ui/kernel/render/render-target';

describe('shared popup motion', () => {
	it.each([false, true])(
		'keeps one lifecycle owner and cancels superseded work (custom base=%s)',
		async (custom) => {
			const cleanup = vi.fn();
			const initial = vi.fn();
			const firstStop = vi.fn();
			const nextStop = vi.fn();
			const animate = vi.fn(() => firstStop);
			const nextAnimate = vi.fn(() => nextStop);
			const oninit = vi.fn(() => cleanup);
			const onmount = vi.fn();
			const ondestroy = vi.fn();
			const base = custom ? componentBase(HtmlElement) : undefined;
			const fixture = render(Fixture, {
				base,
				oninit,
				onmount,
				ondestroy,
				motion: { initial, animate }
			});
			expect(initial).toHaveBeenCalledTimes(1);
			expect(animate).toHaveBeenCalledTimes(1);
			expect(oninit).toHaveBeenCalledTimes(1);
			expect(onmount).toHaveBeenCalledTimes(1);
			await fixture.rerender({
				base,
				oninit,
				onmount,
				ondestroy,
				motion: { initial, animate: nextAnimate }
			});
			expect(firstStop).toHaveBeenCalledTimes(1);
			expect(nextAnimate).toHaveBeenCalledTimes(1);
			expect(initial).toHaveBeenCalledTimes(1);
			expect(oninit).toHaveBeenCalledTimes(1);
			expect(onmount).toHaveBeenCalledTimes(1);
			fixture.unmount();
			expect(nextStop).toHaveBeenCalledTimes(1);
			expect(cleanup).toHaveBeenCalledTimes(1);
			expect(ondestroy).toHaveBeenCalledTimes(1);
		}
	);
});
