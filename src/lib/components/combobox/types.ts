import type { Snippet } from 'svelte';
import type { HtmlAtomProps, Base, SnippetProps } from '$svelte-atoms/core/components/atom';
import type { Factory } from '$svelte-atoms/core/types';
import type { ComboboxBond } from './bond.svelte';
import type {
	SelectSelectionProps as DropdownSelectionProps,
	SelectSelectionsProps as DropdownSelectionsProps
} from '../select';
import type { InputControlProps } from '../input';

// ============================================================================
// Combobox Snippet Props (Extensible)
// ============================================================================

export interface ComboboxSnippetProps extends SnippetProps {
	combobox: ComboboxBond;
}

export type ComboboxChildren = Snippet<[ComboboxSnippetProps]>;

export interface ComboboxRootProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, ComboboxChildren> {
	open?: boolean;
	value?: unknown;
	values?: unknown[];
	label?: string;
	labels?: string[];
	multiple?: boolean;
	disabled?: boolean;
	placements?: string[];
	placement?: string;
	offset?: number;
	// Two-way-bindable search/filter text (bind:query). Bound by createBondFilter; cleared by Escape (ClearThenClose).
	query?: string;
	factory?: Factory<ComboboxBond>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ComboboxSelectionsProps extends DropdownSelectionsProps {
	//
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ComboboxSelectionProps extends DropdownSelectionProps {
	//
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ComboboxControlProps extends InputControlProps {
	//
}

export interface ComboboxSelection {
	id: string;
	label: string;
	createdAt: Date;
	unselect: () => void;
}
