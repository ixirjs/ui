import { defineAtom } from '$ixirjs/ui/shared/bond';
import { internCapabilityFactory } from '$ixirjs/ui/shared/capability/intern';
import { defineBond, type BondOf } from '$ixirjs/ui/shared';
import {
	ariaRole,
	defineAtomCapability,
	sharedCapabilityKey,
	type AtomHost
} from '$ixirjs/ui/shared/capability';
import {
	OverlayBond,
	ModalContentAtom,
	ModalRootAtom,
	ESCAPE,
	escapePolicy,
	modalCapabilities,
	TRIGGER,
	type ModalOverlayElements,
	type OverlayStateProps
} from '$ixirjs/ui/components/overlay';
import type { StateChangeContext } from '$ixirjs/ui/types';

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
	#openChangeContext: Pick<StateChangeContext, 'event' | 'reason'> | undefined;

	constructor(props: Props, name = 'dialog') {
		super(props, name);
	}

	stageOpenChange(context: Pick<StateChangeContext, 'event' | 'reason'>): void {
		this.#openChangeContext = context;
		queueMicrotask(() => {
			if (this.#openChangeContext === context) this.#openChangeContext = undefined;
		});
	}

	takeOpenChangeContext(): Pick<StateChangeContext, 'event' | 'reason'> {
		const context = this.#openChangeContext ?? {};
		this.#openChangeContext = undefined;
		return context;
	}
}

// -----------------------------------------------------------------------------
// Internal types
// -----------------------------------------------------------------------------

type DialogBondView = DialogBondBase<DialogBondProps>;

// -----------------------------------------------------------------------------
// Capability slots and shared helpers
// -----------------------------------------------------------------------------

const DIALOG_TITLE = sharedCapabilityKey<void>({
	owner: '@ixirjs/dialog',
	name: 'title',
	version: 1
});
const DIALOG_BODY = sharedCapabilityKey<void>({
	owner: '@ixirjs/dialog',
	name: 'body',
	version: 1
});

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

const dialogTitlePresentation = internCapabilityFactory(function dialogTitlePresentation() {
	return defineAtomCapability<void, AtomHost, DialogBondView>({
		slot: DIALOG_TITLE,
		meta: {
			projects: ['title'],
			docs: 'Dialog title heading projection.'
		},
		attach: {
			attrs: () => ({
				role: 'heading',
				'aria-level': 2
			})
		}
	});
});

const dialogBodyPresentation = internCapabilityFactory(function dialogBodyPresentation() {
	return defineAtomCapability<void, AtomHost, DialogBondView>({
		slot: DIALOG_BODY,
		meta: {
			projects: ['body'],
			docs: 'Dialog body live region projection.'
		},
		attach: {
			attrs: () => ({
				role: 'region',
				'aria-live': 'polite'
			})
		}
	});
});

// Controlled modal disclosure (no trigger — use PopoverDialog for that); trigger capability filtered out.
// Nested popovers teleport into the dialog's own in-content OverlayPortal, so they position with the
// default 'absolute' strategy against an in-content offsetParent — no fixed override needed.

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

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
		root: { atom: DialogRootAtom, selfLayer: true },
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
