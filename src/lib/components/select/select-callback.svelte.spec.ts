import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SelectRoot from './select-root.svelte';
import type { SelectBond } from './bond.svelte';

describe('Select callbacks', () => {
	it('reports committed open, selection, and query transitions only once', () => {
		const onopenchange = vi.fn((value: boolean, { bond }: { bond?: SelectBond }) => {
			expect(bond?.props.open).toBe(value);
		});
		const onvaluechange = vi.fn((value: unknown, { bond }: { bond?: SelectBond }) => {
			expect(bond?.props.values?.[0]).toBe(value);
		});
		const onvalueschange = vi.fn((value: unknown[], { bond }: { bond?: SelectBond }) => {
			expect(bond?.props.values).toEqual(value);
		});
		const onquerychange = vi.fn((value: string, { bond }: { bond?: SelectBond }) => {
			expect(bond?.props.query).toBe(value);
		});
		const { component } = render(SelectRoot, {
			onopenchange,
			onvaluechange,
			onvalueschange,
			onquerychange
		});
		const bond = (component as unknown as { getBond(): SelectBond }).getBond();

		expect(onopenchange).not.toHaveBeenCalled();
		expect(onvaluechange).not.toHaveBeenCalled();
		expect(onvalueschange).not.toHaveBeenCalled();
		expect(onquerychange).not.toHaveBeenCalled();

		bond.open();
		bond.select(['alpha']);
		bond.props.query = 'alp';

		expect(onopenchange).toHaveBeenCalledWith(true, { bond });
		expect(onvaluechange).toHaveBeenCalledWith('alpha', { bond });
		expect(onvalueschange).not.toHaveBeenCalled();
		expect(onquerychange).toHaveBeenCalledWith('alp', { bond });

		bond.open();
		bond.select(['alpha']);
		bond.props.query = 'alp';
		expect(onopenchange).toHaveBeenCalledTimes(1);
		expect(onvaluechange).toHaveBeenCalledTimes(1);
		expect(onvalueschange).not.toHaveBeenCalled();
		expect(onquerychange).toHaveBeenCalledTimes(1);
	});

	it('reports selected arrays through onvalueschange in multiple mode', () => {
		const onvaluechange = vi.fn();
		const onvalueschange = vi.fn();
		const { component } = render(SelectRoot, {
			multiple: true,
			onvaluechange,
			onvalueschange
		});
		const bond = (component as unknown as { getBond(): SelectBond }).getBond();

		bond.select(['alpha', 'beta']);

		expect(onvaluechange).not.toHaveBeenCalled();
		expect(onvalueschange).toHaveBeenCalledWith(['alpha', 'beta'], { bond });
	});

	it('does not report parent-controlled prop echoes', async () => {
		const onopenchange = vi.fn();
		const onvaluechange = vi.fn();
		const onvalueschange = vi.fn();
		const onquerychange = vi.fn();
		const { component, rerender } = render(SelectRoot, {
			onopenchange,
			onvaluechange,
			onvalueschange,
			onquerychange
		});

		const bond = (component as unknown as { getBond(): SelectBond }).getBond();
		await rerender({ open: true, value: 'parent', query: 'par' });

		expect(bond.props.open).toBe(true);
		expect(bond.props.values).toEqual(['parent']);
		expect(bond.props.query).toBe('par');
		expect(onopenchange).not.toHaveBeenCalled();
		expect(onvaluechange).not.toHaveBeenCalled();
		expect(onvalueschange).not.toHaveBeenCalled();
		expect(onquerychange).not.toHaveBeenCalled();
	});
});
