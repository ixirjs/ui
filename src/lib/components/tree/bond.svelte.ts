import { Bond, Atom } from '$svelte-atoms/core/shared/bond';
import { defineBond, type BondOf } from '$svelte-atoms/core/shared';
import {
	createDisclosure,
	disclosureCapability,
	disclosureTrigger,
	type Disclosure
} from '$svelte-atoms/core/shared/capability/models/disclosure.svelte';
import type { DisclosureStateProps } from '$svelte-atoms/core/shared/capability/models/disclosure-state.svelte';
import { treeItemGroupLink } from '$svelte-atoms/core/shared/capability/models/relationship.svelte';
import { isBrowser } from '$svelte-atoms/core/utils/dom.svelte';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type TreeBondProps = DisclosureStateProps;

export type TreeBondElements = {
	root: HTMLElement;
	header: HTMLElement;
	body: HTMLElement;
	indicator: HTMLElement;
};

// Minimal bond view — breaks the atom↔bond cycle.

// -----------------------------------------------------------------------------
// Internal types
// -----------------------------------------------------------------------------

type TreeBondView = TreeBondBase;

export class TreeRootAtom extends Atom<TreeBondView, HTMLElement> {
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
			'aria-labelledby': bond.atomByRole('treeitem')?.id,
			'aria-disabled': isDisabled
		};
	}
}

class TreeHeaderAtom extends Atom<TreeBondView, HTMLElement> {
	constructor(bond: TreeBondView) {
		super(bond, 'header');
		this.role('treeitem');
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

class TreeBodyAtom extends Atom<TreeBondView, HTMLElement> {
	constructor(bond: TreeBondView) {
		super(bond, 'body');
		this.role('treegroup');
	}
	override get attrs() {
		// aria-labelledby + role=group come from the trigger↔content link (role:'content').
		return {
			...super.attrs
		};
	}
}

class TreeIndicatorAtom extends Atom<TreeBondView, HTMLElement> {
	constructor(bond: TreeBondView) {
		super(bond, 'indicator');
	}
}

// Captures the parent tree bond from context, enabling nesting.

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

class TreeBondBase extends Bond<TreeBondProps> {
	#parent: TreeBond | undefined;
	readonly disclosure: Disclosure = createDisclosure({
		get: () => this.props.open,
		set: (v) => (this.props.open = v)
	});

	constructor(props: TreeBondProps, name = 'tree') {
		super(props, name);
		this.#parent = getOptionalParentTree();
		this.capability(disclosureCapability(this.disclosure));
		// treeitem↔group link: header gets aria-expanded/controls; body gets aria-labelledby/group.
		this.capability(treeItemGroupLink(this.disclosure));
		this.capability(disclosureTrigger({ event: 'pointerdown' }));
	}

	get parent(): TreeBond | undefined {
		return this.#parent;
	}

	get isOpen(): boolean {
		return this.disclosure.isOpen;
	}

	open(): void {
		this.disclosure.open();
	}

	close(): void {
		this.disclosure.close();
	}

	toggle(): void {
		this.disclosure.toggle();
	}
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function getOptionalParentTree(): TreeBond | undefined {
	try {
		return TreeBond.get();
	} catch {
		return undefined;
	}
}

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

const TreeBondImpl = defineBond<
	{
		root: typeof TreeRootAtom;
		header: { atom: typeof TreeHeaderAtom; role: 'trigger' };
		body: { atom: typeof TreeBodyAtom; role: 'content' };
		indicator: typeof TreeIndicatorAtom;
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
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

export type TreeBond = BondOf<typeof TreeBondImpl>;

interface TreeBondConstructor {
	new (props: TreeBondProps): TreeBond;
	readonly CONTEXT_KEY: string;
	readonly spec: (typeof TreeBondImpl)['spec'];
	get(): TreeBond | undefined;
	getOrThrow(message?: string): TreeBond;
	set(bond: TreeBond): TreeBond;
	create(props: TreeBondProps): TreeBond;
}

export const TreeBond = TreeBondImpl as unknown as TreeBondConstructor;
