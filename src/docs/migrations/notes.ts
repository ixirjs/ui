// Hand-written migration notes.
//
// Current migration intent, not automatic codemods. Historical version boundaries are unknown.
// No live migration planner consumes this file today; do not infer a released-version mapping.
//
// `since` is the first verified version requiring the change. An absent boundary means
// unknown applicability, never permission to apply a migration to all earlier versions.

export type MigrationNote = {
	id: string;
	title: string;
	/** Version that first required this change. Omitted = unknown version boundary; do not apply automatically. */
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
		id: 'plain-state-kernel',
		title: 'Replace the historical Bond/Atom authoring runtime with plain state and Kernel',
		detail:
			'The historical BondState/Bond base classes, defineBond, useRoot, usePart and createAtomInstance are absent from the adopted baseline. Author a plain state class, share it through Kernel.context, and render parts through Kernel.element from @ixirjs/ui/shared. Keep live props and bindable commit timing. The exact release boundary is not verified; do not apply this note automatically from a version comparison.',
		find: 'BondState|defineBond|useRoot|usePart|createAtomInstance',
		doc: 'migration'
	},
	{
		id: 'popup-state-ownership',
		title: 'Use the canonical popup state contract',
		detail:
			'The adopted baseline has type-only popup family names and no popup factory props. Application composition uses props, snippets and presets. Root-owned getBond()/snippet state must not be disposed manually. Standalone authors use PopupBond.create from @ixirjs/ui/experimental and own disposal; custom roots use PopupBond.mount. Non-popup factories remain supported. The exact published release boundary is not verified.',
		find: 'new (PopoverBond|SelectBond|ComboboxBond|DropdownMenuBond|TooltipBond|ContextMenuBond|DatePickerBond|PopoverDialogBond)',
		doc: 'migration'
	},
	{
		id: 'additive-first-baseline',
		title: 'Keep working application APIs after the adopted baseline',
		detail:
			'Future upgrades are additive-first with no scheduled removals. Keep existing imports, aliases, factories, bindings, callback semantics and augmentation. Deprecations remain supported. Historical name-only archives do not establish a complete release-to-release migration path; unknown version ranges must be reported as unknown, never as a safe automatic migration.',
		doc: 'migration'
	}
];
