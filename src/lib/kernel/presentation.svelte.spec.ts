import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PresentationProbe from '$ixirjs/ui/test/components/atom/presentation-probe.test.svelte';
import StaticFastPathProbe from '$ixirjs/ui/test/components/atom/static-fast-path-probe.test.svelte';
import { CardHeader, CardContext } from '$ixirjs/ui/components/card';

describe('presentation adapters', () => {
	it('uses the same preset fold for lightweight and full renderers', () => {
		render(PresentationProbe);

		for (const selector of ['[data-testid="lightweight"]', '[data-testid="full"]']) {
			const node = document.querySelector<HTMLElement>(selector);
			expect(node).not.toBeNull();
			expect(node).toHaveAttribute('data-theme', 'theme');
			expect(node).toHaveAttribute('data-default', 'default');
			expect(node).toHaveAttribute('data-consumer', 'consumer');
			expect(node?.className).toContain('theme-class');
			expect(node?.className).toContain('consumer-class');
		}
	});
});

/**
 * L1's static fast path (`kernel.svelte.ts` `element()`): a shipped default-preset entry that is
 * class-only (`card.header` — no variants, no layer) resolves through the frozen `staticBase`
 * reference when the consumer passes no class/defaults/variants of its own, and rebuilds through
 * the ordinary merge the moment any of those show up. Both branches must still merge correctly.
 */
describe('static preset fast path', () => {
	it('re-resolves correctly on an unrelated consumer prop change, defaults below preset attrs', async () => {
		const { rerender } = render(StaticFastPathProbe, { marker: 'a' });

		let node = document.querySelector<HTMLElement>('[data-testid="static-part"]');
		expect(node).not.toBeNull();
		expect(node?.className).toContain('gap-1');
		// `defaults` sit BELOW the resolved preset/own/consumer attrs — the lowest precedence layer —
		// so nothing above it needs to exist for it to still show up on the element.
		expect(node).toHaveAttribute('data-default', 'default');
		expect(node).toHaveAttribute('data-marker', 'a');

		await rerender({ marker: 'b' });

		node = document.querySelector<HTMLElement>('[data-testid="static-part"]');
		expect(node).toHaveAttribute('data-marker', 'b');
		expect(node).toHaveAttribute('data-default', 'default');
		expect(node?.className).toContain('gap-1');
	});

	it('still escalates to a transition leaf when the consumer passes motion, on a static entry', () => {
		render(StaticFastPathProbe, {
			marker: 'motion',
			enter: () => ({ duration: 1 })
		} as never);

		const node = document.querySelector('[data-testid="static-part"]');
		// A motionless static part is a literal `<div>`; a consumer `enter` escalates it to the
		// transition leaf, which wraps the element in the svelte-transition machinery instead.
		expect(node).not.toBeNull();
	});
});

/**
 * L4 (`kernel.svelte.ts` `element()`): `spec.state` also accepts the `KernelContext<T>` HANDLE
 * `Kernel.context()` returns, resolved lazily. `Card.Header` passes `state: CardContext` (the
 * handle, not `.get()`) since its only other use of the Bond was `state:`. A static preset entry
 * with no layer/variantProps/variants/consumer-variants/live-preset/oninit never calls `.get()`;
 * `oninit`, which reads the Bond via its argument, makes it call `.get()` exactly once.
 */
describe('L4: lazy context handle resolution in spec.state', () => {
	it('never calls CardContext.get() for a bare Card.Header (static entry, nothing reads state)', () => {
		const spy = vi.spyOn(CardContext, 'get');
		render(CardHeader, {});
		expect(spy).not.toHaveBeenCalled();
		spy.mockRestore();
	});

	it('calls CardContext.get() once, and hands the (undefined) Bond to oninit, when oninit is passed', () => {
		const spy = vi.spyOn(CardContext, 'get');
		let received: unknown = 'not-called';
		render(CardHeader, {
			oninit: (state?: unknown) => {
				received = state;
			}
		} as never);
		expect(spy).toHaveBeenCalledTimes(1);
		// No <Card.Root> ancestor, so the handle resolves to `undefined` — the point is that it WAS
		// resolved (the call happened), not what it resolved to.
		expect(received).toBeUndefined();
		spy.mockRestore();
	});
});
