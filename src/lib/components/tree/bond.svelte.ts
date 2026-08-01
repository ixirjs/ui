import { Bond, BondAtom } from '$svelte-atoms/core/shared/bond.svelte';
import { defineBond, type BondOf, type ViewOf } from '$svelte-atoms/core/shared';
import {
	createDisclosure,
	type Disclosure
} from '$svelte-atoms/core/shared/capabilities/disclosure.svelte';
import {
	DisclosureState,
	type DisclosureStateProps
} from '$svelte-atoms/core/shared/capabilities/disclosure-state.svelte';
import { triggerContentLink } from '$svelte-atoms/core/shared/capabilities/relationship.svelte';
import { isBrowser } from '$svelte-atoms/core/utils/dom.svelte';

export type TreeBondProps = DisclosureStateProps;

export type TreeBondElements = {
	root: HTMLElement;
	header: HTMLElement;
	body: HTMLElement;
	indicator: HTMLElement;
};

// Minimal bond view — breaks the atom↔bond cycle.
type TreeBondView = ViewOf<TreeBondState>;

class TreeRootAtom extends BondAtom<TreeBondView, HTMLElement> {
	constructor(bond: TreeBondView) {
		super(bond, 'root');
	}
	override get attrs() {
		const bond = this.bond;
		const props = bond.state?.props;
		const isDisabled = props?.disabled ?? false;

		// aria-expanded lives on the header (trigger↔content link); root labelled by the header.
		return {
			...super.attrs,
			'aria-labelledby': bond.atomByRole('trigger')?.id,
			'aria-disabled': isDisabled
		};
	}
}

class TreeHeaderAtom extends BondAtom<TreeBondView, HTMLElement> {
	constructor(bond: TreeBondView) {
		super(bond, 'header');
	}
	override get attrs() {
		const bond = this.bond;
		const isButtonElement = isBrowser() ? bond.elements.header instanceof HTMLButtonElement : false;
		const role = isButtonElement ? '' : 'button';
		const tabindex = !isButtonElement || bond.state.props.disabled ? -1 : 0;
		// aria-controls + aria-expanded come from the trigger↔content link (role:'trigger').
		return {
			...super.attrs,
			role,
			tabindex
		};
	}
}

class TreeBodyAtom extends BondAtom<TreeBondView, HTMLElement> {
	constructor(bond: TreeBondView) {
		super(bond, 'body');
	}
	override get attrs() {
		// aria-labelledby + role=group come from the trigger↔content link (role:'content').
		return {
			...super.attrs
		};
	}
}

class TreeIndicatorAtom extends BondAtom<TreeBondView, HTMLElement> {
	constructor(bond: TreeBondView) {
		super(bond, 'indicator');
	}
}

// Captures the parent tree bond from context, enabling nesting.
class TreeBondBase extends Bond<TreeBondProps, TreeBondState> {
	#parent: TreeBond | undefined;

	constructor(state: TreeBondState) {
		super(state, 'tree');
		this.#parent = TreeBond.get();
	}

	get parent(): TreeBond | undefined {
		return this.#parent;
	}
}

export const TreeBond = defineBond<
	{
		root: typeof TreeRootAtom;
		header: { atom: typeof TreeHeaderAtom; role: 'trigger' };
		body: { atom: typeof TreeBodyAtom; role: 'content' };
		indicator: typeof TreeIndicatorAtom;
	},
	TreeBondState,
	typeof TreeBondBase
>({
	name: 'tree',
	base: TreeBondBase,
	atoms: {
		root: TreeRootAtom,
		header: { atom: TreeHeaderAtom, role: 'trigger' },
		body: { atom: TreeBodyAtom, role: 'content' },
		indicator: TreeIndicatorAtom
	}
});

export type TreeBond = BondOf<typeof TreeBond>;

export class TreeBondState<Props extends TreeBondProps = TreeBondProps> extends DisclosureState<Props> {
	// Storage stays in props.open. isOpen/open/close/toggle are inherited.
	readonly disclosure: Disclosure = createDisclosure({
		get: () => this.props.open,
		set: (v) => (this.props.open = v)
	});

	constructor(props: Props) {
		super(props);
		// trigger↔content link (§11.3): header gets aria-expanded/controls; body gets aria-labelledby/group.
		this.capability(triggerContentLink(this.disclosure, { contentRole: 'group' }));
	}
}
