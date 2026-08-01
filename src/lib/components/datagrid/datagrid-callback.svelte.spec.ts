import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { StateChangeContext } from '$ixirjs/ui/types';
import { DataGridBond } from './bond.svelte';
import Root from './datagrid-root.svelte';
import Column from './column/datagrid-column.svelte';
import { DataGridColumnBond, type DataGridColumnBondProps } from './column/bond.svelte';
import Row from './row/datagrid-row.svelte';
import { DataGridRowBond, type DataGridRowBondProps } from './row/bond.svelte';
import Cell from './cell/datagrid-cell.svelte';
import Checkbox from './datagrid-checkbox.svelte';
import type { SortBy } from './types';

describe('DataGrid callbacks', () => {
	it('reports committed selection transitions without initialization or parent echoes', async () => {
		const committedStates: boolean[] = [];
		const onvalueschange = vi.fn((values: string[], { bond }: StateChangeContext<DataGridBond>) => {
			committedStates.push(bond?.props.values === values);
		});
		const { component, rerender } = render(Root, {
			values: ['alpha'],
			onvalueschange
		});
		const bond = component.getBond();

		expect(onvalueschange).not.toHaveBeenCalled();

		bond.select(['beta']);
		expect(onvalueschange).toHaveBeenCalledWith(['alpha', 'beta'], { bond });
		expect(committedStates).toEqual([true]);

		bond.select(['beta']);
		expect(onvalueschange).toHaveBeenCalledTimes(1);

		const event = new Event('input');
		bond.unselect(['alpha'], { event });
		expect(onvalueschange).toHaveBeenLastCalledWith(['beta'], { bond, event });
		expect(committedStates).toEqual([true, true]);

		await rerender({ values: ['parent'] });
		expect(bond.props.values).toEqual(['parent']);
		expect(onvalueschange).toHaveBeenCalledTimes(2);
	});

	it('forwards the native selection event after checkbox selection commits', () => {
		const onvalueschange = vi.fn();
		const rootRender = render(Root, { onvalueschange });
		const datagrid = rootRender.component.getBond();
		let row: DataGridRowBond | undefined;
		const rowRender = render(Row, {
			props: {
				value: 'alpha',
				factory: (props: DataGridRowBondProps) => {
					row = DataGridRowBond.create(props);
					return row;
				}
			},
			context: new Map([[DataGridBond.CONTEXT_KEY, datagrid]])
		});
		if (!row) throw new Error('Expected the row factory to run synchronously.');
		const checkboxRender = render(Checkbox, {
			context: new Map<string, unknown>([
				[DataGridBond.CONTEXT_KEY, datagrid],
				[DataGridRowBond.CONTEXT_KEY, row]
			])
		});
		const input = checkboxRender.container.querySelector<HTMLInputElement>('input')!;
		let nativeInputEvent: Event | undefined;
		input.addEventListener('input', (event) => (nativeInputEvent = event));

		checkboxRender.container.querySelector<HTMLElement>('[role="checkbox"]')!.click();

		expect(nativeInputEvent).toBeInstanceOf(Event);
		expect(onvalueschange).toHaveBeenCalledWith(['alpha'], {
			bond: datagrid,
			event: nativeInputEvent
		});
		expect(datagrid.props.values).toEqual(['alpha']);

		checkboxRender.unmount();
		rowRender.unmount();
		rootRender.unmount();
	});

	it('reports semantic sort state after commit with the actual click event', () => {
		const datagrid = DataGridBond.create({ values: [] });
		let column: DataGridColumnBond | undefined;
		const onclick = vi.fn();
		const committedStates: boolean[] = [];
		const onsort = vi.fn(
			(sort: SortBy, context: StateChangeContext<DataGridColumnBond, MouseEvent>) => {
				committedStates.push(context.bond?.props.direction === sort.direction);
			}
		);
		const { container, unmount } = render(Column, {
			props: {
				id: 'name',
				direction: 'asc',
				sortable: 'displayName',
				onclick,
				onsort,
				factory: (props: DataGridColumnBondProps) => {
					column = DataGridColumnBond.create(props);
					return column;
				}
			},
			context: new Map([[DataGridBond.CONTEXT_KEY, datagrid]])
		});
		const event = new MouseEvent('click', { bubbles: true });

		container.querySelector<HTMLElement>('.sortable')!.dispatchEvent(event);

		expect(onclick.mock.calls[0]).toEqual([event]);
		expect(onsort).toHaveBeenCalledWith(
			{ id: 'name', by: 'displayName', direction: 'desc' },
			{ bond: column, event, reason: 'click' }
		);
		expect(committedStates).toEqual([true]);

		unmount();
		datagrid.destroy();
	});

	it('keeps row, column, and cell onclick native and honors column cancellation', () => {
		const columnGrid = DataGridBond.create({ values: [] });
		const columnClick = vi.fn((event: MouseEvent) => event.preventDefault());
		const onsort = vi.fn();
		const columnRender = render(Column, {
			props: { id: 'name', sortable: true, onclick: columnClick, onsort },
			context: new Map([[DataGridBond.CONTEXT_KEY, columnGrid]])
		});
		const columnEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
		columnRender.container.querySelector<HTMLElement>('.sortable')!.dispatchEvent(columnEvent);

		expect(columnClick.mock.calls[0]).toEqual([columnEvent]);
		expect(onsort).not.toHaveBeenCalled();
		columnRender.unmount();
		columnGrid.destroy();

		const rowGrid = DataGridBond.create({ values: [] });
		const rowClick = vi.fn();
		const rowRender = render(Row, {
			props: { value: 'alpha', onclick: rowClick },
			context: new Map([[DataGridBond.CONTEXT_KEY, rowGrid]])
		});
		const rowEvent = new MouseEvent('click', { bubbles: true });
		rowRender.container.querySelector<HTMLElement>('.datagrid-row')!.dispatchEvent(rowEvent);

		expect(rowClick.mock.calls[0]).toEqual([rowEvent]);
		rowRender.unmount();
		rowGrid.destroy();

		const cellGrid = DataGridBond.create({ values: [] });
		const cellClick = vi.fn();
		const cellRender = render(Cell, {
			props: { onclick: cellClick },
			context: new Map([[DataGridBond.CONTEXT_KEY, cellGrid]])
		});
		const cellEvent = new MouseEvent('click', { bubbles: true });
		cellRender.container.firstElementChild!.dispatchEvent(cellEvent);

		expect(cellClick.mock.calls[0]).toEqual([cellEvent]);
		cellRender.unmount();
		cellGrid.destroy();
	});
});
