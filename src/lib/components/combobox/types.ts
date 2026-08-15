import type { Snippet } from 'svelte';
import type {
	RenderProps,
	Base,
	SnippetProps,
	HtmlElementTagName
} from '$ixirjs/ui/components/atom';
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
	/**
	 * Controls whether the combobox dropdown is open. Can be bound for controlled usage.
	 * @default false
	 */
	open?: boolean;
	/** The currently selected value in single-select mode. */
	value?: unknown;
	/** Array of selected values in multi-select mode. */
	values?: unknown[];
	/** Display label for the currently selected item (single-select mode). */
	label?: string;
	/** Array of display labels for selected items (multi-select mode). */
	labels?: string[];
	/**
	 * When true, enables multiple item selection and shows selection chips.
	 * @default false
	 */
	multiple?: boolean;
	/**
	 * Disables the combobox, preventing user interaction.
	 * @default false
	 */
	disabled?: boolean;
	/** Ordered list of preferred placement positions for the dropdown content. */
	placements?: string[];
	/** Preferred placement position for the dropdown content (floating-ui placement value). */
	placement?: string;
	/**
	 * Distance in pixels between the trigger and the dropdown content.
	 * @default 0
	 */
	offset?: number;
	/** Data keys `filterSelectData` searches. Defaults to every string field on the item. */
	keys?: string[];
	/** Two-way-bindable search text. Read by `filterSelectData`, cleared by Escape (`ClearThenClose`). */
	query?: string;
	/** Per-instance presentation overrides for bonded Combobox parts. */
	presets?: ComboboxPresets | undefined;
	/** Custom factory function to create a ComboboxBond instance. */
	factory?: Factory<ComboboxBond>;
	/** Combobox content. Receives the ComboboxBond instance for custom composition. */
	children?: ComboboxChildren;
	/** Fired after open state commits. */
	onopenchange?: StateChangeCallback<boolean, ComboboxBond>;
	/** Fired after the selected value commits in single mode. */
	onvaluechange?: StateChangeCallback<unknown, ComboboxBond>;
	/** Fired after the selected values commit in multiple mode. */
	onvalueschange?: StateChangeCallback<unknown[], ComboboxBond>;
	/** Fired after the filter query commits. */
	onquerychange?: StateChangeCallback<string, ComboboxBond>;
}

export interface ComboboxItemProps<
	T = unknown,
	E extends HtmlElementTagName = 'li',
	B extends Base = Base
> extends RenderProps<E, B, ComboboxChildren> {
	/** Current value of the control. */
	value?: string;
	/** Arbitrary payload carried on the Bond, returned by lookups and snippet props. */
	data?: T;
	/** Disables the control: it stops responding and is removed from the tab order. */
	disabled?: boolean;
	/** Content of this part. */
	children?: ComboboxChildren;
}

export interface ComboboxTriggerProps<
	E extends HtmlElementTagName = 'button',
	B extends Base = Base
> extends RenderProps<E, B, ComboboxChildren> {}

export interface ComboboxSelectionsProps extends DropdownSelectionsProps {}

export interface ComboboxSelectionProps extends DropdownSelectionProps {}

export interface ComboboxControlProps extends InputControlProps {
	/** Placeholder text for the input */
	placeholder?: string | undefined;
}

export interface ComboboxSelection {
	id: string;
	label: string;
	createdAt: Date;
	unselect: () => void;
}
