import type { Component, Snippet } from 'svelte';
import type { HtmlAtomProps, Base, SnippetProps } from '$svelte-atoms/core/components/atom';
import type { Factory } from '$svelte-atoms/core/types';
import type { SelectBond } from './bond.svelte';
import type { ClassValue } from 'svelte/elements';
import type { SelectItemController } from './item';
import type { SelectItemAtom } from './item/bond.svelte';

// Snippet props (extensible)

export interface SelectSnippetProps extends SnippetProps {
	select: SelectBond;
	/** @deprecated Use `select` instead. */
	dropdown: SelectBond;
}

export type SelectChildren = Snippet<[SelectSnippetProps]>;

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
	// Two-way-bindable filter text; driven by `createBondFilter`, cleared by Escape (`ClearThenClose`).
	query?: string;
	factory?: Factory<SelectBond>;
	children?: SelectChildren;
	onquerychange?: (query: string) => void;
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
	onclose?: (event: Event) => void;
}

export interface SelectQueryProps extends HtmlAtomProps<'input'> {
	value?: string;
	children?: Snippet;
}

export interface SelectSelection {
	readonly id: string;
	readonly value?: string;
	readonly label: string;
	readonly createdAt: Date;
	unselect: () => void;
	// The backing item — a `SelectItemAtom` (common) or `SelectItemController` facade.
	controller?: SelectItemAtom<unknown> | SelectItemController<unknown>;
}
