import type { Component, Snippet } from 'svelte';
import type { HtmlAtomProps, Base, SnippetProps } from '$ixirjs/ui/components/atom';
import type { Factory, StateChangeCallback } from '$ixirjs/ui/types';
import type { SelectBond } from './bond.svelte';
import type { DropdownMenuPresets } from '$ixirjs/ui/components/dropdown-menu';
import type { PresetLike } from '$ixirjs/ui/preset';
import type { ClassValue } from 'svelte/elements';

// Snippet props (extensible)

export interface SelectSnippetProps extends SnippetProps {
	select: SelectBond;
}

export type SelectChildren = Snippet<[SelectSnippetProps]>;

/** Per-instance presentation layers for Select's bonded and composed parts. */
export interface SelectPresets extends DropdownMenuPresets {
	placeholder?: PresetLike;
	query?: PresetLike;
	value?: PresetLike;
}

export interface SelectRootProps<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	T = any
> {
	open?: boolean;
	value?: T;
	values?: T[];
	label?: string;
	labels?: string[];
	multiple?: boolean;
	disabled?: boolean;
	placements?: string[];
	placement?: string;
	offset?: number;
	keys?: string[];
	// Two-way-bindable filter text; read by `filterSelectData`, cleared by Escape (`ClearThenClose`).
	query?: string;
	/** Per-instance presentation overrides for bonded Select parts. */
	presets?: SelectPresets | undefined;
	factory?: Factory<SelectBond>;
	children?: SelectChildren;
	onopenchange?: StateChangeCallback<boolean, SelectBond>;
	onvaluechange?: StateChangeCallback<T | undefined, SelectBond>;
	onvalueschange?: StateChangeCallback<T[], SelectBond>;
	onquerychange?: StateChangeCallback<string, SelectBond>;
}

// Extends HtmlAtomProps directly (PopoverTriggerProps is itself an empty `HtmlAtomProps<…,
// PopoverChildren>`): an `Override<…>` here would Omit-collapse `as`/etc. to `unknown` via
// HtmlAtomProps' index signature. The 3rd generic swaps in SelectChildren cleanly.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SelectTriggerProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, SelectChildren> {}

export interface SelectSelectionsProps {
	class?: ClassValue;
	Selection?: Component | undefined;
	children?: Snippet<
		[
			{
				selections: SelectSelection[];
				selection?: SelectSelection | undefined;
			}
		]
	>;
	getSelections?: <T extends SelectBond>(bond: T) => SelectSelection[];
}

export interface SelectSelectionProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B> {
	selection: SelectSelection;
	children?: Snippet;
	ondismiss?: ((ev: MouseEvent) => void) | undefined;
}

export interface SelectQueryProps extends HtmlAtomProps<'input'> {
	value?: string;
	children?: Snippet;
}

export interface SelectSelectionHandle {
	readonly id: string;
	readonly value: string;
	readonly label: string;
	readonly createdAt: Date;
	unselect(): void;
}

export interface SelectSelection {
	readonly id: string;
	readonly value?: string;
	readonly label: string;
	readonly createdAt: Date;
	unselect: () => void;
	controller?: SelectSelectionHandle;
}
