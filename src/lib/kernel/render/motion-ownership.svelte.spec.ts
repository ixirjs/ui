import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';
import KernelElement from '$ixirjs/ui/test/components/atom/kernel-element.test.svelte';
import HtmlElement from '$ixirjs/ui/components/element/html-element.svelte';
import { componentBase } from './render-target';
import { useElementMotion } from '$ixirjs/ui/components/element/use-element-motion.svelte';

vi.mock('$ixirjs/ui/components/element/use-element-motion.svelte', { spy: true });

beforeEach(() => {
	vi.mocked(useElementMotion).mockClear();
});

describe('rendered-node motion ownership', () => {
	it.each(['div', 'section'] as const)('constructs one owner for animate-only %s', (as) => {
		const initial = vi.fn();
		const stop = vi.fn();
		const animate = vi.fn(() => stop);
		const onmount = vi.fn();
		const ondestroy = vi.fn();
		const app = render(KernelElement<'div' | 'section'>, {
			as,
			motion: { initial, animate },
			onmount,
			ondestroy,
			'data-testid': 'motion'
		});
		expect(app.container.querySelector(as)).not.toBeNull();
		expect(useElementMotion).toHaveBeenCalledTimes(1);
		expect(initial).toHaveBeenCalledTimes(1);
		expect(animate).toHaveBeenCalledTimes(1);
		expect(onmount).toHaveBeenCalledTimes(1);
		app.unmount();
		expect(stop).toHaveBeenCalledTimes(1);
		expect(ondestroy).toHaveBeenCalledTimes(1);
	});

	it.each([
		['div', false],
		['div', true],
		['section', false],
		['section', true]
	] as const)('constructs one owner for a %s transition leaf (global=%s)', (as, global) => {
		const initial = vi.fn();
		const app = render(KernelElement<'div' | 'section'>, {
			as,
			motion: { initial, enter: () => ({ duration: 1 }) },
			global
		});
		expect(useElementMotion).toHaveBeenCalledTimes(1);
		expect(initial).toHaveBeenCalledTimes(1);
		app.unmount();
	});

	it.each([HtmlElement, KernelElement])('leaves a base renderer in charge of motion', (base) => {
		const animate = vi.fn();
		const app = render(KernelElement<'div'>, {
			base: componentBase(base as never),
			motion: { animate }
		});
		expect(app.container.querySelector('div')).not.toBeNull();
		expect(useElementMotion).toHaveBeenCalledTimes(1);
		expect(animate).toHaveBeenCalledTimes(1);
		app.unmount();
	});

	it('keeps the delegated owner through motion updates', async () => {
		const initial = vi.fn();
		const stop = vi.fn();
		const nextStop = vi.fn();
		const animate = vi.fn(() => stop);
		const nextAnimate = vi.fn(() => nextStop);
		const onmount = vi.fn();
		const ondestroy = vi.fn();
		const props = { motion: { initial, animate }, onmount, ondestroy };
		const app = render(KernelElement<'div' | 'section'>, { ...props, as: 'div' });
		const first = app.container.querySelector('div');
		await app.rerender({ ...props, motion: { initial, animate: nextAnimate }, as: 'div' });
		expect(app.container.querySelector('div')).toBe(first);
		expect(stop).toHaveBeenCalledTimes(1);
		expect(nextAnimate).toHaveBeenCalledTimes(1);
		expect(first?.isConnected).toBe(true);
		expect(useElementMotion).toHaveBeenCalledTimes(1);
		expect(initial).toHaveBeenCalledTimes(1);
		expect(onmount).toHaveBeenCalledTimes(1);
		expect(ondestroy).not.toHaveBeenCalled();
		expect(nextStop).not.toHaveBeenCalled();
		app.unmount();
		expect(nextStop).toHaveBeenCalledTimes(1);
		expect(ondestroy).toHaveBeenCalledTimes(1);
	});

	it('releases the old renderer owner when a custom base changes', async () => {
		const stop = vi.fn();
		const animate = vi.fn(() => stop);
		const onmount = vi.fn();
		const ondestroy = vi.fn();
		const props = { motion: { animate }, onmount, ondestroy };
		const app = render(KernelElement<'div'>, {
			...props,
			base: componentBase(HtmlElement as never)
		});
		expect(useElementMotion).toHaveBeenCalledTimes(1);
		await app.rerender({ ...props, base: componentBase(KernelElement as never) });
		expect(useElementMotion).toHaveBeenCalledTimes(2); // One per renderer's node, not per wrapper.
		expect(animate).toHaveBeenCalledTimes(2);
		expect(onmount).toHaveBeenCalledTimes(2);
		expect(stop).toHaveBeenCalledTimes(1);
		expect(ondestroy).toHaveBeenCalledTimes(1);
		app.unmount();
		expect(stop).toHaveBeenCalledTimes(2);
		expect(ondestroy).toHaveBeenCalledTimes(2);
	});

	it('forwards raw motion to a snippet without constructing an unused owner', () => {
		const animate = vi.fn();
		const snippet = createRawSnippet<[Record<string, unknown>]>((props) => ({
			render() {
				expect(props().motion).toEqual({ animate });
				return '<div data-testid="snippet"></div>';
			}
		}));
		const app = render(KernelElement<'div'>, {
			base: { kind: 'snippet', snippet: snippet as never },
			motion: { animate }
		});
		expect(app.container.querySelector('[data-testid="snippet"]')).not.toBeNull();
		expect(useElementMotion).not.toHaveBeenCalled();
		expect(animate).not.toHaveBeenCalled(); // This custom renderer deliberately ignores motion.
		app.unmount();
	});

	it('does not construct an owner for a plain leaf', () => {
		const app = render(KernelElement<'div'>, {});
		expect(useElementMotion).not.toHaveBeenCalled();
		app.unmount();
	});
});
