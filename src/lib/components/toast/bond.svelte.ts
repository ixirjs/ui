import { Bond, Atom } from '$svelte-atoms/core/shared/bond';
import { defineBond, type BondOf } from '$svelte-atoms/core/shared/authoring/define.svelte';
import {
	createDisclosure,
	disclosureCapability,
	disclosureClose,
	type Disclosure
} from '$svelte-atoms/core/shared/capability/models/disclosure.svelte';
import type { DisclosureStateProps } from '$svelte-atoms/core/shared/capability/models/disclosure-state.svelte';
import { labelledControl } from '$svelte-atoms/core/shared/capability/models/relationship.svelte';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type ToastBondProps = DisclosureStateProps;

export type ToastBondElements = {
	root: HTMLElement;
	title: HTMLElement;
	description: HTMLElement;
	close: HTMLElement;
};

// Minimal bond view for atoms — avoids atom↔bond circularity through defineBond.

// -----------------------------------------------------------------------------
// Internal types
// -----------------------------------------------------------------------------

type ToastBondView = ToastBondBase;

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

export class ToastRootAtom extends Atom<ToastBondView> {
	constructor(bond: ToastBondView) {
		super(bond, 'root');
	}

	override get attrs() {
		const props = this.bond.state?.props;
		const isOpen = props?.open ?? false;
		const isDisabled = props?.disabled ?? false;

		// aria-labelledby/describedby come from labelledControl (role:'control'); emitted when those atoms exist.
		return {
			...super.attrs,
			role: 'status',
			'aria-live': 'polite',
			'aria-atomic': 'true',
			'aria-disabled': isDisabled ? 'true' : 'false',
			'data-open': isOpen,
			'data-state': isOpen ? 'open' : 'closed'
		};
	}
}

export class ToastTitleAtom extends Atom<ToastBondView> {
	constructor(bond: ToastBondView) {
		super(bond, 'title');
	}
	// id is the default atom id (`toast-title-${bond.id}`), registered via .role('label').
}

export class ToastDescriptionAtom extends Atom<ToastBondView> {
	constructor(bond: ToastBondView) {
		super(bond, 'description');
	}
	// id is the default atom id (`toast-description-${bond.id}`), registered via .role('description').
}

export class ToastCloseAtom extends Atom<ToastBondView> {
	constructor(bond: ToastBondView) {
		super(bond, 'close');
	}

	override get attrs() {
		const el = this.element;
		const isButton = el instanceof Element && el.tagName.toLowerCase() === 'button';
		return {
			...super.attrs,
			type: isButton ? 'button' : undefined,
			role: isButton ? undefined : 'button',
			tabindex: isButton ? undefined : 0,
			'aria-label': 'Dismiss notification'
		};
	}
}

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

class ToastBondBase extends Bond<ToastBondProps> {
	// Storage stays in props.open.
	readonly disclosure: Disclosure = createDisclosure({
		get: () => this.props.open,
		set: (v) => (this.props.open = v)
	});

	constructor(props: ToastBondProps, name = 'toast') {
		super(props, name);
		this.capability(disclosureCapability(this.disclosure));
		this.capability(disclosureClose({ disabled: false, stopPropagation: true }));
		this.capability(labelledControl());
	}

	get isOpen(): boolean {
		return this.disclosure.isOpen;
	}

	get isDisabled() {
		return this.props.disabled;
	}

	// `disabled` is the bond's own guard, layered around the shared disclosure.
	open() {
		if (this.props.disabled) return;
		this.disclosure.open();
	}

	close() {
		this.disclosure.close();
	}

	toggle() {
		if (this.props.disabled) return;
		this.disclosure.toggle();
	}
}

// Toast bond via defineBond: roles and key alias dismiss↔close are generated.

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

const ToastBondImpl = defineBond<
	{
		root: { atom: typeof ToastRootAtom; role: 'control' };
		title: { atom: typeof ToastTitleAtom; role: 'label' };
		description: { atom: typeof ToastDescriptionAtom; role: 'description' };
		dismiss: { atom: typeof ToastCloseAtom; key: 'close'; role: 'close' };
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	typeof ToastBondBase
>({
	name: 'toast',
	base: ToastBondBase,
	atoms: {
		root: { atom: ToastRootAtom, role: 'control' },
		title: { atom: ToastTitleAtom, role: 'label' },
		description: { atom: ToastDescriptionAtom, role: 'description' },
		dismiss: { atom: ToastCloseAtom, key: 'close', role: 'close' }
	}
});

// ToastBond works as both value (new ToastBond(state)) and type (ToastBond | undefined).
export type ToastBond = BondOf<typeof ToastBondImpl>;

interface ToastBondConstructor {
	new (props: ToastBondProps): ToastBond;
	readonly CONTEXT_KEY: string;
	readonly spec: (typeof ToastBondImpl)['spec'];
	get(): ToastBond | undefined;
	getOrThrow(message?: string): ToastBond;
	set(bond: ToastBond): ToastBond;
	create(props: ToastBondProps): ToastBond;
}

export const ToastBond = ToastBondImpl as unknown as ToastBondConstructor;
