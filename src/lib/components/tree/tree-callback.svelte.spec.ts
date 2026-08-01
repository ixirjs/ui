import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CallbackFixture from '$ixirjs/ui/test/components/tree/tree-callback.test.svelte';
import type { TreeBond } from './bond.svelte';

describe('Tree callbacks', () => {
	it('reports committed open transitions once', () => {
		const onopenchange = vi.fn((value: boolean, { bond }: { bond?: TreeBond }) => {
			expect(bond?.isOpen).toBe(value);
		});
		const { component } = render(CallbackFixture, { onopenchange });
		const bond = (component as unknown as { getBond(): TreeBond }).getBond();

		expect(onopenchange).not.toHaveBeenCalled();
		expect(document.querySelector('[data-testid="tree-header"]')).toHaveAttribute(
			'role',
			'treeitem'
		);

		bond.open();
		expect(onopenchange).toHaveBeenCalledWith(true, { bond });

		bond.open();
		expect(onopenchange).toHaveBeenCalledTimes(1);
	});

	it('includes keyboard trigger metadata after the transition commits', () => {
		const onopenchange = vi.fn();
		const { component } = render(CallbackFixture, { onopenchange });
		const bond = (component as unknown as { getBond(): TreeBond }).getBond();
		const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });

		document.querySelector<HTMLElement>('[data-testid="tree-header"]')!.dispatchEvent(event);

		expect(onopenchange).toHaveBeenCalledWith(true, {
			bond,
			event,
			reason: 'trigger'
		});
		expect(bond.isOpen).toBe(true);
	});
});
