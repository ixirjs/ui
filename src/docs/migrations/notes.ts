// Hand-written migration notes.
//
// A surface diff tells you *that* `BondState` disappeared. It cannot tell you that the
// replacement is a `Bond` subclass passed as `defineBond`'s `base`. That intent is authored
// here, once, and the planner merges it with the mechanical diff.
//
// `since` is the version that first *required* the change. Omit it for changes that predate
// the surface archive — those apply to anyone upgrading from before the earliest archived
// version, which is the honest answer when the exact release is not recoverable.

export type MigrationNote = {
	id: string;
	title: string;
	/** Version that first required this change. Omitted = predates the surface archive. */
	since?: string;
	/** What to do, in the imperative. Written for an agent editing a consumer codebase. */
	detail: string;
	/** Regex an agent can grep the consumer's code with to find affected sites. */
	find?: string;
	/** The shape to replace matches with. */
	replace?: string;
	/** Doc slug with the full explanation — readable via the `get-doc` tool. */
	doc?: string;
};

export const migrationNotes: MigrationNote[] = [
	{
		id: 'bondstate-to-bond',
		title: 'Replace BondState hosts with a Bond subclass',
		detail:
			'BondState was removed. State that lived on it belongs on a Bond subclass, which a definition names as its `base`. Keep mutation methods (open/close/toggle/select) on the Bond; read raw inputs from `bond.props` and expose derived state through getters.',
		find: 'extends BondState|BondState<',
		replace:
			'class XBond extends Bond<XProps> { … }  // then: defineBond({ name, base: XBond, atoms })',
		doc: 'migration'
	},
	{
		id: 'atoms-created-in-parts',
		title: 'Create runtime Atoms in the part that renders the element',
		detail:
			'Bond-owned atom factories (`bond.trigger()`, `bond.content()`, `bond.atom(...)`) were removed. The component rendering an element creates its own Atom with `createAtomInstance(slot, { bond, capabilities })`, and fixed descendants use `usePart(...)`.',
		find: 'bond\\.(trigger|content|atom)\\(',
		replace: "createAtomInstance('trigger', { bond: XBond.getOrThrow(), capabilities: [...] })",
		doc: 'migration'
	},
	{
		id: 'registry-lookup',
		title: 'Look up rendered Atoms through the registry',
		detail:
			'Generated part methods are no longer compatibility adapters. Inspect rendered Atoms with `bond.nodeByPart(slot)`, `bond.nodesByPart(slot)` and `bond.nodeByRole(role)`.',
		find: 'bond\\.[a-zA-Z]+\\(\\)\\??\\.element',
		replace: "bond.nodeByPart('trigger')?.element",
		doc: 'migration'
	},
	{
		id: 'canonical-part-names',
		title: 'Use the canonical part names',
		detail:
			'Renamed parts: `Input.Control`, `Combobox.Control`, `DataGrid.Row` / `.Column` / `.Cell`, and `DropdownMenu.Content`. The old aliases were removed rather than deprecated.',
		find: 'Input\\.Field|Combobox\\.Input|DropdownMenu\\.Menu|DataGrid\\.(Rows|Columns|Cells)',
		doc: 'migration'
	},
	{
		id: 'filter-select-data',
		title: 'Use filterSelectData',
		detail: 'The dropdown/filter aliases were removed; `filterSelectData` is the one entry point.',
		find: 'filterDropdownData|filterOptions',
		replace: 'filterSelectData',
		doc: 'components/select'
	},
	{
		id: 'capabilities-over-effects',
		title: 'Move repeated behavior into capabilities',
		detail:
			'Per-root `$effect`s for focus restore, escape handling and disclosure were removed in favor of capabilities composed on the Bond via `this.capability(...)`, plus `useRoot(...)` for props assembly, activation and teardown. Roots rendering no element of their own pass `atom: false`.',
		find: '\\$effect\\(',
		doc: 'crafting'
	}
];
