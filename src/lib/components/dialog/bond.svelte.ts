import { defineAtom } from '$svelte-atoms/core/shared/bond';
import { defineBond, type BondOf } from '$svelte-atoms/core/shared';
import {
	ariaRole,
	defineAtomCapability,
	sharedCapabilityKey,
	type AtomHost
} from '$svelte-atoms/core/shared/capability';
import {
	OverlayBond,
	ModalContentAtom,
	ModalRootAtom,
	modalCapabilities,
	TRIGGER,
	type ModalOverlayElements,
	type OverlayStateProps
} from '$svelte-atoms/core/components/portal/host';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type DialogBondProps = OverlayStateProps & {
	disabled: boolean;
};

export type DialogBondElements = ModalOverlayElements & {
	header?: HTMLElement;
	body?: HTMLElement;
	footer?: HTMLElement;
	close?: HTMLElement;
};

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

export class DialogBondBase<
	Props extends DialogBondProps = DialogBondProps
> extends OverlayBond<Props> {
	constructor(props: Props, name = 'dialog') {
		super(props, name);
	}
}

// -----------------------------------------------------------------------------
// Internal types
// -----------------------------------------------------------------------------

type DialogBondView = DialogBondBase<DialogBondProps>;

// -----------------------------------------------------------------------------
// Capability slots and shared helpers
// -----------------------------------------------------------------------------

const DIALOG_TITLE = sharedCapabilityKey<void>('@svelte-atoms/dialog:title');
const DIALOG_BODY = sharedCapabilityKey<void>('@svelte-atoms/dialog:body');

// Root atom for modal overlays. The shared modal capability wires ARIA, inert, focus, and escape.

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

export const DialogRootAtom = defineAtom(ModalRootAtom<DialogBondView>);
export type DialogRootAtom = InstanceType<typeof DialogRootAtom>;

// Adds role="document" on top of the modal content focus-on-mount behaviour.

export const DialogContentAtom = defineAtom(ModalContentAtom<DialogBondView>, (atom) => {
	atom.capability(ariaRole('document'));
});
export type DialogContentAtom = InstanceType<typeof DialogContentAtom>;

export const DialogHeaderAtom = defineAtom<DialogBondView>('header', (atom) => {
	atom.capability(ariaRole('banner'));
});
export type DialogHeaderAtom = InstanceType<typeof DialogHeaderAtom>;

export const DialogTitleAtom = defineAtom<DialogBondView>('title', (atom) => {
	atom.capability(dialogTitlePresentation());
});
export type DialogTitleAtom = InstanceType<typeof DialogTitleAtom>;

export const DialogDescriptionAtom = defineAtom<DialogBondView>('description');
export type DialogDescriptionAtom = InstanceType<typeof DialogDescriptionAtom>;

export const DialogBodyAtom = defineAtom<DialogBondView>('body', (atom) => {
	atom.capability(dialogBodyPresentation());
});
export type DialogBodyAtom = InstanceType<typeof DialogBodyAtom>;

export const DialogFooterAtom = defineAtom<DialogBondView>('footer', (atom) => {
	atom.capability(ariaRole('contentinfo'));
});
export type DialogFooterAtom = InstanceType<typeof DialogFooterAtom>;

export const DialogCloseAtom = defineAtom<DialogBondView>('close', (atom) => {
	atom.role('close');
});
export type DialogCloseAtom = InstanceType<typeof DialogCloseAtom>;

// -----------------------------------------------------------------------------
// Atom capabilities
// -----------------------------------------------------------------------------

function dialogTitlePresentation() {
	return defineAtomCapability<void, AtomHost, DialogBondView>({
		slot: DIALOG_TITLE,
		meta: {
			layer: 1,
			kind: 'projection',
			projects: ['title'],
			docs: 'Dialog title heading projection.'
		},
		behavior: {
			attrs: () => ({
				role: 'heading',
				'aria-level': 2
			})
		}
	});
}

function dialogBodyPresentation() {
	return defineAtomCapability<void, AtomHost, DialogBondView>({
		slot: DIALOG_BODY,
		meta: {
			layer: 1,
			kind: 'projection',
			projects: ['body'],
			docs: 'Dialog body live region projection.'
		},
		behavior: {
			attrs: () => ({
				role: 'region',
				'aria-live': 'polite'
			})
		}
	});
}

// Controlled modal disclosure (no trigger — use PopoverDialog for that); trigger capability filtered out.
// Nested popovers teleport into the dialog's own in-content OverlayPortal, so they position with the
// default 'absolute' strategy against an in-content offsetParent — no fixed override needed.

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

const DialogBondImpl = defineBond<
	{
		root: typeof DialogRootAtom;
		content: typeof DialogContentAtom;
		header: typeof DialogHeaderAtom;
		title: typeof DialogTitleAtom;
		description: typeof DialogDescriptionAtom;
		body: typeof DialogBodyAtom;
		footer: typeof DialogFooterAtom;
		closeButton: { atom: typeof DialogCloseAtom; key: 'close' };
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	typeof DialogBondBase
>({
	name: 'dialog',
	base: DialogBondBase,
	capabilities: () => modalCapabilities().filter((c) => c.slot !== TRIGGER),
	atoms: {
		root: DialogRootAtom,
		content: DialogContentAtom,
		header: DialogHeaderAtom,
		title: DialogTitleAtom,
		description: DialogDescriptionAtom,
		body: DialogBodyAtom,
		footer: DialogFooterAtom,
		closeButton: { atom: DialogCloseAtom, key: 'close' }
	}
});

// Propagate OverlayBond's context key transitively so fused bonds (e.g. PopoverDialogBond) re-share it.
Object.defineProperty(DialogBondImpl, 'CONTEXT_KEYS', {
	value: [DialogBondImpl.CONTEXT_KEY, OverlayBond.CONTEXT_KEY],
	writable: true,
	configurable: true
});

// Instance type of the dialog bond — paired with the const above (value + type).
export type DialogBond = BondOf<typeof DialogBondImpl>;

interface DialogBondConstructor {
	new (props: DialogBondProps): DialogBond;
	readonly CONTEXT_KEY: string;
	readonly CONTEXT_KEYS?: readonly string[];
	readonly spec: (typeof DialogBondImpl)['spec'];
	get(): DialogBond | undefined;
	getOrThrow(message?: string): DialogBond;
	set(bond: DialogBond): DialogBond;
	create(props: DialogBondProps): DialogBond;
}

export const DialogBond = DialogBondImpl as unknown as DialogBondConstructor;
