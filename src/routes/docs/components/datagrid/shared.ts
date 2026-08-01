const presetCode = `
import { setPreset } from '@ixirjs/ui/preset';

setPreset({
  datagrid: () => ({
    class: 'w-full text-sm'
  }),
  'datagrid.header': () => ({
    class: 'border-b font-medium'
  }),
  'datagrid.row': () => ({
    class: 'border-b transition-colors'
  }),
  'datagrid.column': () => ({
    class: 'h-12 px-4 text-left text-muted-foreground'
  }),
  'datagrid.cell': () => ({
    class: 'px-4 py-2'
  }),
  'datagrid.checkbox': () => ({
    class: 'flex items-center justify-center'
  })
});`.trim();

const accessibilityFeatures = [
	'CSS subgrid layout keeps columns pixel-perfectly aligned across header and body rows',
	'Row selection state tracked via bond — no DOM scanning required',
	'hidden prop on Column automatically hides corresponding Cell cells by DOM index',
	'Sort direction exposed as bindable prop for controlled external state management',
	'header prop on Row prevents row from being registered in the selection map'
];

const useCases = [
	{
		title: 'Admin Data Tables',
		description:
			'Display and manage records (users, orders, products) in admin dashboards with sortable columns and row selection.'
	},
	{
		title: 'Reporting and Analytics',
		description:
			'Present structured data with sortable columns and column visibility controls for business reports and analytics views.'
	},
	{
		title: 'Selectable Row Lists',
		description:
			'Allow users to select one or multiple rows with checkboxes for bulk operations like deletion, export, or status updates.'
	},
	{
		title: 'Inventory Management',
		description:
			'Manage product or asset inventories with rich row data, custom cell rendering via base prop, and action buttons per row.'
	},
	{
		title: 'Log Viewers',
		description:
			'Display time-series or event logs in a structured grid with sortable timestamps and filterable columns.'
	},
	{
		title: 'Comparison Tables',
		description:
			'Show feature comparisons or side-by-side data with fixed header rows and responsive column visibility via hidden prop.'
	},
	{
		title: 'Cross-Row Side Rails',
		description:
			'Create side columns that span all data rows (alphabet index, timeline, status rail) by combining row-span-full containers with subgrid-aligned row content.'
	}
];

const componentsSummary = [
	{
		name: 'DataGrid.Root',
		description:
			'Root grid container. Owns the DataGridBond context, manages column template (auto-computed from Column widths) and selection state via bind:values.'
	},
	{
		name: 'DataGrid.Header',
		description:
			'Header section. Sets the header context — all Row rows inside are treated as header rows and excluded from selection.'
	},
	{
		name: 'DataGrid.Body',
		description: 'Body section. Contains the data rows rendered with DataGrid.Row.'
	},
	{
		name: 'DataGrid.Footer',
		description: 'Optional footer section. Useful for summary rows, pagination controls, or totals.'
	},
	{
		name: 'DataGrid.Row',
		description:
			'Row element using CSS subgrid (grid-column: 1 / -1). Mounts into the selection map unless header=true. Accepts a value prop for selection tracking and a data prop for typed row context.'
	},
	{
		name: 'DataGrid.Column',
		description:
			'Column header cell. Defines column width for auto template computation, supports sortable for click-to-sort with bindable direction, and hidden to exclude the column from the layout.'
	},
	{
		name: 'DataGrid.Cell',
		description:
			'Data cell. Finds its matching Column by DOM index for visibility. Accepts a base prop to render a component (e.g. a dropdown) instead of a plain div.'
	},
	{
		name: 'DataGrid.Checkbox',
		description:
			'Selection checkbox. In header rows: select-all / deselect-all. In body rows: toggles that row. State is automatically derived from the datagrid bond — no manual wiring needed.'
	}
];

export const metadata = {
	title: 'DataGrid - Svelte Atoms',
	description:
		'Flexible CSS subgrid-based data grid for displaying tabular data with sorting, selection, and custom cell rendering.',
	componentTitle: 'DataGrid',
	componentDescription:
		'Grid component for structured data with sortable columns, row selection, custom cell rendering, and responsive columns.',
	componentType: 'compound' as const,
	status: 'stable' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { DataGrid } from '@ixirjs/ui';",
	breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'DataGrid' }],
	useCases,
	componentsSummary,
	examples: {
		preset: presetCode
	},
	accessibility: accessibilityFeatures
};
