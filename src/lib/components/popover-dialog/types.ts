import type { Snippet } from 'svelte';
import type { Base, HtmlAtomProps } from '../atom';
import type { PopoverDialogBond } from './bond.svelte';

// Children snippets receive the fused bond.
type Slot = Snippet<[{ popoverDialog: PopoverDialogBond }]>;

// Root provides context + renders children in document flow; trigger renders in place,
// modal presentation self-portals from `<PopoverDialog.Content>`.
export interface PopoverDialogRootProps<
	E extends keyof HTMLElementTagNameMap = 'dialog',
	B extends Base = Base
> extends HtmlAtomProps<E, B, Slot> {
	open?: boolean;
	disabled?: boolean;
	children?: Slot;
}

// Content owns the modal presentation: self-portals the backdrop around `<Dialog.Content>`.
export interface PopoverDialogContentProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, Slot> {
	type?: 'modal' | 'non-modal';
	'z-index'?: number;
	portal?: string;
	children?: Slot;
	onclick?: (ev: MouseEvent, bond: PopoverDialogBond) => void;
}
