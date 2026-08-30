import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { tick } from 'svelte';
import Probe, {
	capturedBodyRow,
	capturedColumn,
	capturedGeneratedRow,
	capturedGrid,
	capturedHeaderRow,
	resetCapturedDatagridBonds
} from '$ixirjs/ui/test/components/datagrid/datagrid-atom-probe.test.svelte';
import { DataGridBond } from './bond.svelte';
import { DataGridColumnBond } from './column/bond.svelte';
import { DataGridRowBond } from './row/bond.svelte';

// The rendered parts register with the grid at init and release on unmount; the DOM carries the
// ids and ARIA the grid's state projects.
describe('DataGrid rendered parts', () => {
	beforeEach(resetCapturedDatagridBonds);

	it('registers rows and columns and renders their grid semantics', async () => {
		const { unmount } = render(Probe);
		await tick();

		const grid = capturedGrid;
		const headerRow = capturedHeaderRow;
		const bodyRow = capturedBodyRow;
		const generatedRow = capturedGeneratedRow;
		const column = capturedColumn;

		expect(grid).toBeInstanceOf(DataGridBond);
		expect(headerRow).toBeInstanceOf(DataGridRowBond);
		expect(bodyRow).toBeInstanceOf(DataGridRowBond);
		expect(generatedRow).toBeInstanceOf(DataGridRowBond);
		expect(column).toBeInstanceOf(DataGridColumnBond);

		const root = document.querySelector('[role="grid"]');
		expect(root?.id).toBe(`datagrid-root-${grid!.id}`);
		expect(document.getElementById(headerRow!.elementId)?.getAttribute('data-header')).toBe('true');
		expect(document.getElementById(bodyRow!.elementId)?.getAttribute('aria-selected')).toBe('true');
		expect(document.getElementById(column!.elementId)?.getAttribute('role')).toBe('columnheader');

		expect(grid?.rows.get('alpha')).toBe(bodyRow);
		expect(generatedRow?.id).toEqual(expect.any(String));
		expect(generatedRow?.id).not.toBe('');
		expect(grid?.rows.get(generatedRow?.id ?? '')).toBe(generatedRow);
		expect(grid?.rows.get('header')).toBeUndefined();
		expect(grid?.columns.get('name')).toBe(column);
		expect(grid?.selectedRows).toEqual([bodyRow]);
		expect(bodyRow?.isSelected).toBe(true);
		expect(headerRow?.isHeader).toBe(true);
		expect(column?.isSortable).toBe(true);
		expect(grid?.template).toBe('1fr');

		unmount();

		expect(grid?.rows.size).toBe(0);
		expect(grid?.columns.size).toBe(0);
	});
});
