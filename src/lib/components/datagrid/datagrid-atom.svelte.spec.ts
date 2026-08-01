import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { tick } from 'svelte';
import { Atom } from '$svelte-atoms/core/shared/bond';
import Probe, {
	capturedBodyRow,
	capturedColumn,
	capturedGeneratedRow,
	capturedGrid,
	capturedHeaderRow,
	resetCapturedDatagridBonds
} from './datagrid-atom-probe.svelte';
import {
	DataGridBodyAtom,
	DataGridBond,
	DataGridFooterAtom,
	DataGridHeaderAtom,
	DataGridRootAtom
} from './bond.svelte';
import { DataGridColumnBond, DataGridColumnRootAtom } from './column/bond.svelte';
import { DataGridRowBond, DataGridRowRootAtom } from './row/bond.svelte';

describe('DataGrid component-owned Atoms', () => {
	beforeEach(resetCapturedDatagridBonds);

	it('registers rendered datagrid nodes', async () => {
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

		const root = grid?.node('root');
		const header = grid?.node('header');
		const body = grid?.node('body');
		const footer = grid?.node('footer');
		const headerRowRoot = headerRow?.node('root');
		const bodyRowRoot = bodyRow?.node('root');
		const columnRoot = column?.node('root');

		expect(root).toBeInstanceOf(DataGridRootAtom);
		expect(header).toBeInstanceOf(DataGridHeaderAtom);
		expect(body).toBeInstanceOf(DataGridBodyAtom);
		expect(footer).toBeInstanceOf(DataGridFooterAtom);
		expect(headerRowRoot).toBeInstanceOf(DataGridRowRootAtom);
		expect(bodyRowRoot).toBeInstanceOf(DataGridRowRootAtom);
		expect(columnRoot).toBeInstanceOf(DataGridColumnRootAtom);
		for (const node of [root, header, body, footer, headerRowRoot, bodyRowRoot, columnRoot]) {
			expect(node).toBeInstanceOf(Atom);
		}

		expect(grid?.nodes()).toHaveLength(4);
		expect(headerRow?.nodes()).toHaveLength(1);
		expect(bodyRow?.nodes()).toHaveLength(1);
		expect(column?.nodes()).toHaveLength(1);
		expect(grid?.rows.get('alpha')).toBe(bodyRow);
		expect(generatedRow?.id).toEqual(expect.any(String));
		expect(generatedRow?.id).not.toBe('');
		expect(grid?.rows.get(generatedRow?.id ?? '')).toBe(generatedRow);
		expect(grid?.columns.get('name')).toBe(column);
		expect(grid?.selectedRows).toEqual([bodyRow]);
		expect(bodyRow?.isSelected).toBe(true);
		expect(headerRow?.isHeader).toBe(true);
		expect(column?.isSortable).toBe(true);
		expect(grid?.template).toBe('1fr');

		expect(grid?.root()).toBeInstanceOf(DataGridRootAtom);
		expect(grid?.header()).toBeInstanceOf(DataGridHeaderAtom);
		expect(grid?.body()).toBeInstanceOf(DataGridBodyAtom);
		expect(grid?.footer()).toBeInstanceOf(DataGridFooterAtom);
		expect(headerRow?.root()).toBeInstanceOf(DataGridRowRootAtom);
		expect(bodyRow?.root()).toBeInstanceOf(DataGridRowRootAtom);
		expect(column?.root()).toBeInstanceOf(DataGridColumnRootAtom);
		for (const node of [
			grid?.root(),
			grid?.header(),
			grid?.body(),
			grid?.footer(),
			headerRow?.root(),
			bodyRow?.root(),
			column?.root()
		]) {
			expect(node).toBeInstanceOf(Atom);
		}

		unmount();

		expect(grid?.nodes()).toEqual([]);
		expect(headerRow?.nodes()).toEqual([]);
		expect(bodyRow?.nodes()).toEqual([]);
		expect(column?.nodes()).toEqual([]);
		expect(grid?.rows.get('alpha')).toBeUndefined();
		expect(grid?.rows.get(generatedRow?.id ?? '')).toBeUndefined();
		expect(grid?.columns.get('name')).toBeUndefined();
	});
});
