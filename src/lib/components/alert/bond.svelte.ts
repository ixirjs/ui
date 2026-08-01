import { Atom, Bond, type BondStateProps } from '$ixirjs/ui/shared/bond';
import { defineBond, type BondOf } from '$ixirjs/ui/shared';
import { labelledControl } from '$ixirjs/ui/shared/capability/models/relationship.svelte';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type AlertBondProps = BondStateProps & {
	disabled?: boolean;
	extend?: Record<string, unknown>;
};

export type AlertBondElements = {
	root: HTMLElement;
	icon: HTMLElement;
	title: HTMLElement;
	description: HTMLElement;
	content: HTMLElement;
	actions: HTMLElement;
	close: HTMLElement;
};

// -----------------------------------------------------------------------------
// Internal types
// -----------------------------------------------------------------------------

type AlertBondView = AlertBondBase;

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

export class AlertRootAtom extends Atom<AlertBondView> {
	constructor(bond: AlertBondView | undefined) {
		super(bond, 'root', { namespace: 'alert' });
	}

	override get attrs() {
		const disabled = this.bond?.props.disabled ?? false;

		return {
			...super.attrs,
			role: 'alert',
			'aria-disabled': disabled ? 'true' : 'false'
		};
	}
}

export class AlertIconAtom extends Atom<AlertBondView> {
	constructor(bond: AlertBondView | undefined) {
		super(bond, 'icon', { namespace: 'alert' });
	}

	override get attrs() {
		return {
			...super.attrs,
			'aria-hidden': true
		};
	}
}

export class AlertTitleAtom extends Atom<AlertBondView> {
	constructor(bond: AlertBondView | undefined) {
		super(bond, 'title', { namespace: 'alert' });
	}
}

export class AlertDescriptionAtom extends Atom<AlertBondView> {
	constructor(bond: AlertBondView | undefined) {
		super(bond, 'description', { namespace: 'alert' });
	}
}

export class AlertContentAtom extends Atom<AlertBondView> {
	constructor(bond: AlertBondView | undefined) {
		super(bond, 'content', { namespace: 'alert' });
	}
}

export class AlertActionsAtom extends Atom<AlertBondView> {
	constructor(bond: AlertBondView | undefined) {
		super(bond, 'actions', { namespace: 'alert' });
	}
}

export class AlertCloseAtom extends Atom<AlertBondView> {
	constructor(bond: AlertBondView | undefined) {
		super(bond, 'close', { namespace: 'alert' });
	}

	override get attrs() {
		return {
			...super.attrs,
			'aria-label': 'Dismiss alert'
		};
	}
}

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

class AlertBondBase extends Bond<AlertBondProps> {
	constructor(props: AlertBondProps, name = 'alert') {
		super(props, name);
		this.capability(labelledControl());
	}
}

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

export const AlertBond = defineBond({
	name: 'alert',
	base: AlertBondBase,
	atoms: {
		root: { atom: AlertRootAtom, role: 'control' },
		icon: AlertIconAtom,
		title: { atom: AlertTitleAtom, role: 'label' },
		description: { atom: AlertDescriptionAtom, role: 'description' },
		content: AlertContentAtom,
		actions: AlertActionsAtom,
		closeButton: { atom: AlertCloseAtom, part: 'close' }
	}
});

export type AlertBond = BondOf<typeof AlertBond>;
