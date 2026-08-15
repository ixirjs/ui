import { defineAtom } from '$ixirjs/ui/shared/bond';
import { defineBond, type BondOf } from '$ixirjs/ui/shared';
import {
	OverlayBond,
	ModalContentAtom,
	ModalRootAtom,
	ESCAPE,
	escapePolicy,
	modalCapabilities,
	TRIGGER,
	type OverlayStateProps
} from '$ixirjs/ui/components/overlay';

export type DialogBondProps = OverlayStateProps & {
	disabled: boolean;
};

export class DialogBondBase<
	Props extends DialogBondProps = DialogBondProps
> extends OverlayBond<Props> {
	constructor(props: Props, name = 'dialog') {
		super(props, name);
	}
}

type DialogBondView = DialogBondBase<DialogBondProps>;

// Root atom for modal overlays. The shared modal capability wires ARIA, inert, focus, and escape.

export const DialogRootAtom = defineAtom(ModalRootAtom<DialogBondView>);

// Adds role="document" on top of the modal content focus-on-mount behaviour.

export const DialogContentAtom = defineAtom(ModalContentAtom<DialogBondView>, {
	role: 'document'
});

export const DialogHeaderAtom = defineAtom<DialogBondView>('header', { role: 'banner' });

export const DialogTitleAtom = defineAtom<DialogBondView>('title', {
	slot: '@ixirjs/dialog:title',
	docs: 'Dialog title heading projection.',
	attrs: () => ({
		role: 'heading',
		'aria-level': 2
	})
});

export const DialogDescriptionAtom = defineAtom<DialogBondView>('description');

export const DialogBodyAtom = defineAtom<DialogBondView>('body', {
	slot: '@ixirjs/dialog:body',
	docs: 'Dialog body live region projection.',
	attrs: () => ({
		role: 'region',
		'aria-live': 'polite'
	})
});

export const DialogFooterAtom = defineAtom<DialogBondView>('footer', { role: 'contentinfo' });

export const DialogCloseAtom = defineAtom<DialogBondView>('close', (atom) => {
	atom.role('close');
});

// Controlled modal disclosure (no trigger — use PopoverDialog for that); trigger capability filtered out.
// Nested popovers teleport into the dialog's own in-content OverlayPortal, so they position with the
// default 'absolute' strategy against an in-content offsetParent — no fixed override needed.

export const DialogBond = defineBond({
	name: 'dialog',
	base: DialogBondBase,
	capabilities: () => [
		...modalCapabilities().filter(
			(capability) => capability.slot !== TRIGGER && capability.slot !== ESCAPE
		),
		escapePolicy((bond, event) => {
			const dialog = bond as DialogBondBase;
			dialog.stageOpenChange({ event, reason: 'escape' });
			dialog.close();
		})
	],
	atoms: {
		root: { atom: DialogRootAtom },
		content: DialogContentAtom,
		header: { atom: DialogHeaderAtom, cardinality: 'many' },
		title: DialogTitleAtom,
		description: DialogDescriptionAtom,
		body: { atom: DialogBodyAtom, cardinality: 'many' },
		footer: { atom: DialogFooterAtom, cardinality: 'many' },
		closeButton: { atom: DialogCloseAtom, part: 'close', cardinality: 'many' }
	}
});

// Propagate OverlayBond's context key transitively so fused bonds (e.g. PopoverDialogBond) re-share it.
Object.defineProperty(DialogBond, 'CONTEXT_KEYS', {
	value: [DialogBond.CONTEXT_KEY, OverlayBond.CONTEXT_KEY],
	writable: true,
	configurable: true
});

// Instance type of the dialog bond — paired with the const above (value + type).
export type DialogBond = BondOf<typeof DialogBond>;
