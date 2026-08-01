import { Bond, Atom } from '$ixirjs/ui/shared/bond';
import { defineBond, type BondOf } from '$ixirjs/ui/shared';
import {
	createDisclosure,
	disclosureCapability,
	disclosureTrigger,
	type Disclosure
} from '$ixirjs/ui/shared/capability/models/disclosure.svelte';
import type { DisclosureStateProps } from '$ixirjs/ui/shared/capability/models/disclosure-state.svelte';
import { treeItemGroupLink } from '$ixirjs/ui/shared/capability/models/relationship.svelte';
import { isBrowser } from '$ixirjs/ui/utils/dom.svelte';
import type { StateChangeContext } from '$ixirjs/ui/types';

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
		const bond = this.requireBond();
		const props = bond?.props;
		const isDisabled = props?.disabled ?? false;

		// aria-expanded lives on the header (trigger↔content link); root labelled by the header.
		return {
			...super.attrs,
			'aria-labelledby': bond.nodeByRole('treeitem')?.id,
			'aria-disabled': isDisabled
		};
	}
}

export class TreeHeaderAtom extends Atom<TreeBondView, HTMLElement> {
	constructor(bond: TreeBondView) {
		super(bond, 'header');
		this.role('treeitem');
	}
	override get attrs() {
		const bond = this.requireBond();
		const isButtonElement = isBrowser() ? bond.elements.header instanceof HTMLButtonElement : false;
		const tabindex = !isButtonElement || bond.props.disabled ? -1 : 0;
		// The treeitem relationship owns the semantic role; do not compete with it by
		// projecting a native button role for non-button headers.
		return {
			...super.attrs,
			tabindex
		};
	}
}

export class TreeBodyAtom extends Atom<TreeBondView, HTMLElement> {
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

export class TreeIndicatorAtom extends Atom<TreeBondView, HTMLElement> {
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
	#openChangeContext: Pick<StateChangeContext, 'event' | 'reason'> | undefined;
	readonly disclosure: Disclosure = createDisclosure({
		get: () => this.props.open,
		set: (v) => (this.props.open = v)
	});

	constructor(props: TreeBondProps, name = 'tree') {
		super(props, name);
		this.#parent = getOptionalParentTree();
		this.capability(disclosureCapability(this.disclosure));
		// treeitem↔group link: header gets aria-expanded/controls; body gets aria-labelledby/group.
		this.capability(treeItemGroupLink());
		this.capability(disclosureTrigger({ event: 'pointerdown' }));
	}

	get parent(): TreeBond | undefined {
		return this.#parent;
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

export const TreeBond = defineBond({
	name: 'tree',
	base: TreeBondBase,
	atoms: {
		root: { atom: TreeRootAtom, selfLayer: true },
		header: { atom: TreeHeaderAtom, role: 'trigger' },
		body: { atom: TreeBodyAtom, role: 'content' },
		indicator: TreeIndicatorAtom
	}
});

export type TreeBond = BondOf<typeof TreeBond>;
