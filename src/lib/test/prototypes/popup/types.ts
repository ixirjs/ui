import type { ComputePositionReturn, Placement } from '@floating-ui/dom';
import type {
	InputModel,
	RovingFocus,
	SelectionModel,
	TypeaheadSurface
} from '$ixirjs/ui/capability';
import type { KernelElement } from '$ixirjs/ui/kernel/kernel.svelte';
import type { StateChangeContext } from '$ixirjs/ui/types';

export type PopupProfile = 'popover' | 'dropdown-menu' | 'select' | 'combobox';
export type PopupChange = Pick<StateChangeContext, 'event' | 'reason'>;
export interface PopupOption {
	value: string;
	label: string;
	disabled?: boolean;
}

/** Live props owned by the root. Option data is independent of mounted items. */
export interface PopupProps {
	id: string;
	open: boolean;
	disabled?: boolean;
	options?: readonly PopupOption[];
	values?: string[];
	query?: string;
	multiple?: boolean;
	closeOnSelect?: boolean;
	placement?: Placement;
	offset?: number;
	onopenchange?(next: boolean, context: StateChangeContext<PopoverBond>): void;
	onvalueschange?(next: readonly string[], context: StateChangeContext<SelectBond>): void;
	onactivate?(value: string, context: StateChangeContext<DropdownMenuBond>): void;
}

export interface PopupPositioning {
	/** Calculation only; the mounting part owns applying styles and cancelling stale work. */
	compute(reference: Element, content: HTMLElement): Promise<ComputePositionReturn>;
}

// These are contracts, not runtime classes. The factory infers the appropriate contract.
export interface PopoverBond {
	readonly name: PopupProfile;
	readonly id: string;
	readonly isOpen: boolean;
	readonly isDisabled: boolean;
	readonly positioning: PopupPositioning;
	open(change?: PopupChange): void;
	close(change?: PopupChange): void;
	toggle(change?: PopupChange): void;
	partId(part: string): string;
	escape(event: KeyboardEvent): void;
	dispose(): void;
}

export interface DropdownMenuBond extends PopoverBond {
	readonly navigation: RovingFocus<PopupOption>;
	readonly typeahead: TypeaheadSurface;
	readonly mountedCount: number;
	option(value: string): PopupOption | undefined;
	itemId(value: string): string;
	/** Only addresses mounted items, unlike navigation's full option source. */
	mountedItem(value: string): DropdownMenuItemAtom | undefined;
	item(value: string): DropdownMenuItemAtom;
	activate(value: string, change?: PopupChange): void;
}

export interface SelectBond extends DropdownMenuBond {
	readonly selection: SelectionModel<string>;
	readonly labels: readonly string[];
	item(value: string): SelectItemAtom;
	select(value: string, change?: PopupChange): void;
	unselect(value: string, change?: PopupChange): void;
	toggleSelection(value: string, change?: PopupChange): void;
}

export interface ComboboxBond extends SelectBond {
	readonly input: InputModel;
	item(value: string): ComboboxItemAtom;
}

export interface DropdownMenuItemAtom {
	readonly value: string;
	readonly id: string;
	readonly label: string;
	readonly isDisabled: boolean;
	readonly isHighlighted: boolean;
	/** Behavior attributes; PopupAtom.item passes them through the canonical Kernel shell. */
	readonly attrs: Record<string, unknown>;
	activate(change?: PopupChange): void;
	dispose(): void;
}
export interface SelectItemAtom extends DropdownMenuItemAtom {
	readonly isSelected: boolean;
	select(change?: PopupChange): void;
	unselect(change?: PopupChange): void;
	toggle(change?: PopupChange): void;
}
export interface ComboboxItemAtom extends SelectItemAtom {}

export interface PopoverTriggerAtom extends KernelElement {}
export interface DropdownMenuTriggerAtom extends PopoverTriggerAtom {}
export interface SelectTriggerAtom extends DropdownMenuTriggerAtom {}
export interface ComboboxTriggerAtom extends SelectTriggerAtom {}
export interface PopoverContentAtom extends KernelElement {}
export interface DropdownMenuContentAtom extends PopoverContentAtom {}
export interface SelectContentAtom extends DropdownMenuContentAtom {}
export interface ComboboxContentAtom extends SelectContentAtom {}
export interface ComboboxQueryAtom extends KernelElement {}

export interface PopupBonds {
	popover: PopoverBond;
	'dropdown-menu': DropdownMenuBond;
	select: SelectBond;
	combobox: ComboboxBond;
}
export interface PopupTriggerAtoms {
	popover: PopoverTriggerAtom;
	'dropdown-menu': DropdownMenuTriggerAtom;
	select: SelectTriggerAtom;
	combobox: ComboboxTriggerAtom;
}
export interface PopupContentAtoms {
	popover: PopoverContentAtom;
	'dropdown-menu': DropdownMenuContentAtom;
	select: SelectContentAtom;
	combobox: ComboboxContentAtom;
}
