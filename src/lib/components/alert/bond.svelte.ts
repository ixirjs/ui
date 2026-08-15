import { Atom, Bond, type BondStateProps } from '$ixirjs/ui/shared/bond';
import { defineBond, type BondOf } from '$ixirjs/ui/shared';
import {
	labelledControl,
	liveRegionRelationship
} from '$ixirjs/ui/shared/capability/models/relationship.svelte';

export type AlertBondProps = BondStateProps & {
	disabled?: boolean;
	extend?: Record<string, unknown>;
};

class AlertRootAtom extends Atom<AlertBondBase> {
	constructor(bond: AlertBondBase | undefined) {
		super(bond, 'root', { namespace: 'alert' });
	}

	override get attrs() {
		const disabled = this.bond?.props.disabled ?? false;

		// role comes from liveRegionRelationship; role="alert" already implies assertive + atomic,
		// so no aria-live/aria-atomic is emitted alongside it.
		return {
			...super.attrs,
			'aria-disabled': disabled ? 'true' : 'false'
		};
	}
}

class AlertIconAtom extends Atom<AlertBondBase> {
	constructor(bond: AlertBondBase | undefined) {
		super(bond, 'icon', { namespace: 'alert' });
	}

	override get attrs() {
		return {
			...super.attrs,
			'aria-hidden': true
		};
	}
}

class AlertCloseAtom extends Atom<AlertBondBase> {
	constructor(bond: AlertBondBase | undefined) {
		super(bond, 'close', { namespace: 'alert' });
	}

	override get attrs() {
		return {
			...super.attrs,
			'aria-label': 'Dismiss alert'
		};
	}
}

class AlertBondBase extends Bond<AlertBondProps> {
	constructor(props: AlertBondProps, name = 'alert') {
		super(props, name);
		this.registerCapabilities([
			labelledControl(),
			liveRegionRelationship({ role: 'control', liveRole: 'alert' })
		]);
	}
}

export const AlertBond = defineBond({
	name: 'alert',
	base: AlertBondBase,
	atoms: {
		root: { atom: AlertRootAtom, role: 'control' },
		icon: AlertIconAtom,
		// Presentation-free slots: `defineBond` synthesizes the Atom from the slot name and `name`.
		title: { role: 'label' },
		description: { role: 'description' },
		content: {},
		actions: {},
		closeButton: { atom: AlertCloseAtom, part: 'close' }
	}
});

export type AlertBond = BondOf<typeof AlertBond>;
