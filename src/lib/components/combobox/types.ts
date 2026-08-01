import type { Snippet } from 'svelte';
import type { HtmlAtomProps, Base, SnippetProps } from '$ixirjs/ui/components/atom';
import type { Factory, StateChangeCallback } from '$ixirjs/ui/types';
import type { ComboboxBond } from './bond.svelte';
import type {
	SelectPresets,
	SelectSelectionProps as DropdownSelectionProps,
	SelectSelectionsProps as DropdownSelectionsProps
} from '$ixirjs/ui/components/select';
import type { PresetLike } from '$ixirjs/ui/preset';
import type { InputControlProps } from '$ixirjs/ui/components/input';

// Snippet props (extensible)

export interface ComboboxSnippetProps extends SnippetProps {
	combobox: ComboboxBond;
}

export type ComboboxChildren = Snippet<[ComboboxSnippetProps]>;

/** Per-instance presentation layers for Combobox's bonded and composed parts. */
export interface ComboboxPresets extends SelectPresets {
	control?: PresetLike;
}

export interface ComboboxRootProps {
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
	keys?: string[];
	// Two-way-bindable search/filter text (bind:query). Read by filterSelectData; cleared by Escape (ClearThenClose).
	query?: string;
	/** Per-instance presentation overrides for bonded Combobox parts. */
	presets?: ComboboxPresets | undefined;
	factory?: Factory<ComboboxBond>;
	children?: ComboboxChildren;
	onopenchange?: StateChangeCallback<boolean, ComboboxBond>;
	onvaluechange?: StateChangeCallback<unknown, ComboboxBond>;
	onvalueschange?: StateChangeCallback<unknown[], ComboboxBond>;
	onquerychange?: StateChangeCallback<string, ComboboxBond>;
}

export interface ComboboxItemProps<
	T = unknown,
	E extends keyof HTMLElementTagNameMap = 'li',
	B extends Base = Base
> extends HtmlAtomProps<E, B, ComboboxChildren> {
	value?: string;
	data?: T;
	disabled?: boolean;
	children?: ComboboxChildren;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ComboboxTriggerProps<
	E extends keyof HTMLElementTagNameMap = 'button',
	B extends Base = Base
> extends HtmlAtomProps<E, B, ComboboxChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ComboboxSelectionsProps extends DropdownSelectionsProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ComboboxSelectionProps extends DropdownSelectionProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ComboboxControlProps extends InputControlProps {}

export interface ComboboxSelection {
	id: string;
	label: string;
	createdAt: Date;
	unselect: () => void;
}
