import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { tick } from 'svelte';
import { Atom } from '$ixirjs/ui/shared/bond';
import Probe, {
	capturedBodyRow,
	capturedColumn,
	capturedGeneratedRow,
	capturedGrid,
	capturedHeaderRow,
	resetCapturedDatagridBonds
} from '$ixirjs/ui/test/components/datagrid/datagrid-atom-probe.test.svelte';
import {
	DataGridBodyAtom,
	DataGridBond,
	DataGridFooterAtom,
	DataGridHeaderAtom,
	DataGridRootAtom
} from './bond.svelte';
import { DataGridColumnBond, DataGridColumnRootAtom } from './column/bond.svelte';
import { DataGridRowBond, DataGridRowRootAtom } from './row/bond.svelte';
import Body from './datagrid-body.svelte';

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

		const root = grid?.nodeByPart('root');
		const header = grid?.nodeByPart('header');
		const body = grid?.nodeByPart('body');
		const footer = grid?.nodeByPart('footer');
		const headerRowRoot = headerRow?.nodeByPart('root');
		const bodyRowRoot = bodyRow?.nodeByPart('root');
		const columnRoot = column?.nodeByPart('root');

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

		expect(grid?.nodesByPart('root')).toEqual([root]);
		expect(grid?.nodesByPart('header')).toEqual([header]);
		expect(grid?.nodesByPart('body')).toEqual([body]);
		expect(grid?.nodesByPart('footer')).toEqual([footer]);
		expect(headerRow?.nodesByPart('root')).toEqual([headerRowRoot]);
		expect(bodyRow?.nodesByPart('root')).toEqual([bodyRowRoot]);
		expect(column?.nodesByPart('root')).toEqual([columnRoot]);
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

		expect(grid?.nodeByPart('root')).toBeInstanceOf(DataGridRootAtom);
		expect(grid?.nodeByPart('header')).toBeInstanceOf(DataGridHeaderAtom);
		expect(grid?.nodeByPart('body')).toBeInstanceOf(DataGridBodyAtom);
		expect(grid?.nodeByPart('footer')).toBeInstanceOf(DataGridFooterAtom);
		expect(headerRow?.nodeByPart('root')).toBeInstanceOf(DataGridRowRootAtom);
		expect(bodyRow?.nodeByPart('root')).toBeInstanceOf(DataGridRowRootAtom);
		expect(column?.nodeByPart('root')).toBeInstanceOf(DataGridColumnRootAtom);
		for (const node of [
			grid?.nodeByPart('root'),
			grid?.nodeByPart('header'),
			grid?.nodeByPart('body'),
			grid?.nodeByPart('footer'),
			headerRow?.nodeByPart('root'),
			bodyRow?.nodeByPart('root'),
			column?.nodeByPart('root')
		]) {
			expect(node).toBeInstanceOf(Atom);
		}

		unmount();

		for (const part of ['root', 'header', 'body', 'footer']) {
			expect(grid?.nodesByPart(part)).toEqual([]);
		}
		expect(headerRow?.nodesByPart('root')).toEqual([]);
		expect(bodyRow?.nodesByPart('root')).toEqual([]);
		expect(column?.nodesByPart('root')).toEqual([]);
		expect(grid?.rows.get('alpha')).toBeUndefined();
		expect(grid?.rows.get(generatedRow?.id ?? '')).toBeUndefined();
		expect(grid?.columns.get('name')).toBeUndefined();
	});

	it('rejects DataGrid.Body outside its root context', () => {
		expect(() => render(Body)).toThrow('DataGrid.Body must be used within DataGrid.Root.');
	});
});
