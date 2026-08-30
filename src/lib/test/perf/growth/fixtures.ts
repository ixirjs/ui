/**
 * The growth-shape registry: one entry per family that owns a child `Collection`.
 *
 * Membership is not a judgement call — `grep -rn "this.collection<" src/lib/components` is the list.
 * A family that registers n children with one parent Bond can develop the O(n²) described in
 * `docs/research/perf-vs-shadcn-2026-08.md` §7; one that cannot, cannot.
 */
import Accordion from './accordion.test.svelte';
import DataGrid from './datagrid.test.svelte';
import DataGridColumns from './datagrid-columns.test.svelte';
import DropdownMenu from './dropdown-menu.test.svelte';
import Select from './select.test.svelte';
import Stepper from './stepper.test.svelte';
import Tabs from './tabs.test.svelte';
import Tree from './tree.test.svelte';
import TreeDepth from './tree-depth.test.svelte';

export type GrowthFixture = {
	name: string;
	/** What one child IS — printed, never assumed. */
	unit: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	component: any;
	/**
	 * Mount sizes. Lower them only for a family too slow to run the default — and if you have to,
	 * that is itself the finding, so say why here.
	 */
	counts?: [number, number, number, number];
};

export const FIXTURES: GrowthFixture[] = [
	{ name: 'accordion', unit: 'item', component: Accordion },
	{ name: 'tabs', unit: 'tab', component: Tabs },
	{ name: 'tree', unit: 'node', component: Tree },
	// The other axis of the same family. The node fixture renders n siblings at depth 2, so every
	// read that walks the ancestor chain -- `keyboardOwner`, which every header's `attrs` goes
	// through -- costs O(1) there and is unmeasured. One node per level makes n the depth.
	{ name: 'tree-depth', unit: 'level', component: TreeDepth, counts: [25, 50, 100, 200] },
	{ name: 'datagrid', unit: 'row', component: DataGrid },
	// The other axis of the same family. The row fixture renders no columns at all, so the only
	// owner-wide per-child read the grid has — every cell resolving its column through
	// `columns.values` — is unreachable from it. Counts are halved because one unit here is a
	// column across four rows, i.e. five rendered parts rather than one.
	{
		name: 'datagrid-columns',
		unit: 'column',
		component: DataGridColumns,
		counts: [25, 50, 100, 200]
	},
	// Named for the component DIRECTORY, not for convenience: `growth-coverage.spec.ts` compares
	// this list against `src/lib/components/*`, so a nickname reads as an uncovered family.
	{ name: 'dropdown-menu', unit: 'item', component: DropdownMenu },
	{ name: 'select', unit: 'option', component: Select },
	{ name: 'stepper', unit: 'step', component: Stepper }
];

export const DEFAULT_COUNTS: [number, number, number, number] = [50, 100, 200, 400];
