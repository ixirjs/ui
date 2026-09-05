import { expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { flushSync } from 'svelte';
import { installPreset, getPreset } from '$ixirjs/ui/preset/context.svelte';
import KernelElement from '$ixirjs/ui/test/components/atom/kernel-element.test.svelte';

it('keeps composed factories tracked per Bond and falls back after a registry entry changes', async () => {
	const first = $state({ active: false });
	const second = $state({ active: true });
	let calls = 0;
	installPreset({
		'card.header': () => ({
			class: 'base-theme',
			defaults: { tone: 'hot' },
			variants: { tone: { hot: { class: 'hot-theme' } } }
		})
	});
	installPreset({
		'card.header': ({ bond }) => {
			calls++;
			return { class: (bond as typeof first).active ? 'active-theme' : 'inactive-theme' };
		}
	});
	const a = render(KernelElement<'div'>, {
		preset: 'card.header',
		bond: first,
		class: 'consumer',
		'data-testid': 'a'
	});
	const b = render(KernelElement<'div'>, {
		preset: 'card.header',
		bond: second,
		'data-testid': 'b'
	});
	try {
		const left = a.container.querySelector('[data-testid="a"]')!;
		const right = b.container.querySelector('[data-testid="b"]')!;
		expect(left).toHaveClass('base-theme', 'hot-theme', 'inactive-theme', 'consumer');
		expect(right).toHaveClass('active-theme');
		const initial = calls;
		first.active = true;
		flushSync();
		expect(calls).toBeGreaterThan(initial);
		expect(left).toHaveClass('active-theme');
		first.active = false;
		flushSync();
		expect(left).toHaveClass('inactive-theme');
		expect(right).toHaveClass('active-theme');
		getPreset()!['card.header'] = () => ({ class: 'replacement' });
		await a.rerender({ class: 'changed-consumer' });
		expect(left).toHaveClass('replacement', 'changed-consumer');
		expect(left).not.toHaveClass('inactive-theme');
	} finally {
		a.unmount();
		b.unmount();
	}
});
