import { page } from '@vitest/browser/context';
import { render } from 'vitest-browser-svelte';
import { describe, expect, it, vi } from 'vitest';
import type { StateChangeContext } from '$ixirjs/ui/types';
import CallbackFixture from '$ixirjs/ui/test/components/tabs/tabs-callback.test.svelte';
import type { TabsBond } from './bond.svelte';
import TabsRoot from './tabs-root.svelte';

describe('Tabs callbacks', () => {
	it('reports committed selection transitions and keeps onchange native', () => {
		const committedStates: boolean[] = [];
		const onvaluechange = vi.fn(
			(value: string | undefined, { bond }: StateChangeContext<TabsBond>) => {
				committedStates.push(bond?.activeValue === value);
			}
		);
		const onchange = vi.fn();
		const { component } = render(TabsRoot, {
			id: 'tabs-callback-root',
			value: 'one',
			onvaluechange,
			onchange
		});
		const bond = component.getBond();

		expect(onvaluechange).not.toHaveBeenCalled();

		bond.select('two');
		expect(onvaluechange).toHaveBeenCalledWith('two', { bond });
		expect(committedStates).toEqual([true]);

		bond.select('two');
		expect(onvaluechange).toHaveBeenCalledTimes(1);

		const changeEvent = new Event('change', { bubbles: true });
		const root = bond.nodeByPart('root')?.element as HTMLElement;
		root.dispatchEvent(changeEvent);
		expect(onchange).toHaveBeenCalledWith(changeEvent);
		expect(onvaluechange).toHaveBeenCalledTimes(1);
	});

	it('preserves the tab header onclick event and cancellation semantics', async () => {
		const onvaluechange = vi.fn();
		const onclick = vi.fn((event: MouseEvent) => event.preventDefault());
		render(CallbackFixture, { onclick, onvaluechange });

		const firstTab = page.getByRole('tab', { name: 'One' });
		const selectedTab = page.getByRole('tab', { name: 'Two' });
		expect(onvaluechange).not.toHaveBeenCalled();
		await expect.element(selectedTab).toHaveAttribute('aria-selected', 'true');

		await firstTab.click();

		expect(onclick).toHaveBeenCalledOnce();
		expect(onclick.mock.calls[0]).toHaveLength(1);
		expect(onclick.mock.calls[0]?.[0]).toBeInstanceOf(MouseEvent);
		expect(onvaluechange).not.toHaveBeenCalled();
		await expect.element(selectedTab).toHaveAttribute('aria-selected', 'true');
	});
});
