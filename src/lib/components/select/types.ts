import type { Component, Snippet } from 'svelte';
import type {
	RenderProps,
	Base,
	SnippetProps,
	HtmlElementTagName
} from '$ixirjs/ui/components/atom';
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
	T = any,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Option = any
> {
	/**
	 * Open
	 * @default false
	 */
	open?: boolean;
	/** Value */
	value?: T;
	/** Values */
	values?: T[];
	/** Label */
	label?: string;
	/** Labels */
	labels?: string[];
	/**
	 * Multiple
	 * @default false
	 */
	multiple?: boolean;
	/**
	 * Disabled
	 * @default false
	 */
	disabled?: boolean;
	/** Placements */
	placements?: string[];
	/** Placement */
	placement?: string;
	/**
	 * Offset
	 * @default 0
	 */
	offset?: number;
	/** Keys */
	keys?: string[];
	/**
	 * The full ordered option data. Supplying it moves roving, typeahead and selected-label resolution
	 * off the mounted Collection and onto the data — so you can window the list yourself with
	 * `createVirtual` inside `Select.Content` and still navigate, search and label options that were
	 * never mounted. Omit it and Select behaves as before.
	 */
	options?: readonly Option[];
	/** Stable, unique value per option. Required alongside `options`. */
	optionValue?: (option: Option, index: number) => string;
	/** Display and typeahead text per option. */
	optionLabel?: (option: Option, index: number) => string;
	/** Two-way-bindable filter text. Read by `filterSelectData`, cleared by Escape (`ClearThenClose`). */
	query?: string;
	/** Per-instance presentation overrides for bonded Select parts. */
	presets?: SelectPresets | undefined;
	/** Factory */
	factory?: Factory<SelectBond>;
	/** Children */
	children?: SelectChildren;
	/** Fired after open state commits. */
	onopenchange?: StateChangeCallback<boolean, SelectBond>;
	/** Fired after the selected value commits in single mode. */
	onvaluechange?: StateChangeCallback<T | undefined, SelectBond>;
	/** Fired after the selected values commit in multiple mode. */
	onvalueschange?: StateChangeCallback<T[], SelectBond>;
	/** Fired after the filter query commits. */
	onquerychange?: StateChangeCallback<string, SelectBond>;
}

// Extends RenderProps directly (PopoverTriggerProps is itself an empty `RenderProps<…,
// PopoverChildren>`): an `Override<…>` here would Omit-collapse `as`/etc. to `unknown` via
// RenderProps' index signature. The 3rd generic swaps in SelectChildren cleanly.
export interface SelectTriggerProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, SelectChildren> {}

export interface SelectSelectionsProps {
	/** CSS class for the selections container */
	class?: ClassValue;
	/** Replaces the component rendering each selected item. */
	Selection?: Component | undefined;
	/** Children content snippet */
	children?: Snippet<
		[
			{
				selections: SelectSelection[];
				selection?: SelectSelection | undefined;
			}
		]
	>;
	/** Custom function to retrieve selections from the bond */
	getSelections?: <T extends SelectBond>(bond: T) => SelectSelection[];
}

export interface SelectSelectionProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B> {
	/** Selection object containing id, value, label, and unselect function (required) */
	selection: SelectSelection;
	/** Children content snippet */
	children?: Snippet;
	/** Callback fired when the selection is closed/removed */
	ondismiss?: ((ev: MouseEvent) => void) | undefined;
}

export interface SelectQueryProps extends RenderProps<'input'> {
	/** Value */
	value?: string;
	/** Children */
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
