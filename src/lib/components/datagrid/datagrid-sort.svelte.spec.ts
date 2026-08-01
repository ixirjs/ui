import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Column from '$ixirjs/ui/components/datagrid/column/datagrid-column.svelte';
import { DataGridBond } from '$ixirjs/ui/components/datagrid/bond.svelte';
import type { SortBy } from '$ixirjs/ui/components/datagrid/types';

function renderColumn(
	grid: ReturnType<typeof DataGridBond.create>,
	props: Record<string, unknown>
) {
	return render(Column, {
		props,
		context: new Map([[DataGridBond.CONTEXT_KEY, grid]])
	});
}

describe('DataGrid sort capability', () => {
	it('projects columnheader semantics and aria-sort from the shared model', async () => {
		const grid = DataGridBond.create({ values: [] });
		const { container, unmount } = renderColumn(grid, { id: 'name', sortable: true });
		const header = container.querySelector<HTMLElement>('.sortable')!;

		expect(header.getAttribute('role')).toBe('columnheader');
		// Focusable, so the keyboard path below is actually reachable.
		expect(header.getAttribute('tabindex')).toBe('0');
		expect(header.getAttribute('aria-sort')).toBeNull();

		header.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		await Promise.resolve();
		expect(header.getAttribute('aria-sort')).toBe('descending');

		unmount();
		grid.destroy();
	});

	it('sorts from the keyboard', () => {
		const grid = DataGridBond.create({ values: [] });
		const onsort = vi.fn();
		const { container, unmount } = renderColumn(grid, {
			id: 'name',
			sortable: 'displayName',
			onsort
		});
		const header = container.querySelector<HTMLElement>('.sortable')!;

		header.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

		expect(onsort).toHaveBeenCalledOnce();
		const [sort, context] = onsort.mock.calls[0] as [SortBy, { reason?: string }];
		expect(sort).toEqual({ id: 'name', by: 'displayName', direction: 'desc' });
		expect(context.reason).toBe('keyboard');

		unmount();
		grid.destroy();
	});

	it('hands the sort to the last column pressed, so only one column reports as sorted', async () => {
		const grid = DataGridBond.create({ values: [] });
		const first = renderColumn(grid, { id: 'name', sortable: true });
		const second = renderColumn(grid, { id: 'role', sortable: true });
		const firstHeader = first.container.querySelector<HTMLElement>('.sortable')!;
		const secondHeader = second.container.querySelector<HTMLElement>('.sortable')!;

		firstHeader.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		await Promise.resolve();
		expect(firstHeader.getAttribute('aria-sort')).toBe('descending');

		secondHeader.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		await Promise.resolve();
		// The previously sorted column stops claiming the sort — the defect the shared model fixes.
		expect(secondHeader.getAttribute('aria-sort')).toBe('descending');
		expect(firstHeader.getAttribute('aria-sort')).toBeNull();
		expect(grid.sort.field).toBe('role');

		first.unmount();
		second.unmount();
		grid.destroy();
	});
});
