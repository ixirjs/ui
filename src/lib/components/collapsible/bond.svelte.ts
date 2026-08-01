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

export type CollapsibleStateProps = DisclosureStateProps & {
	value?: string;
	data?: unknown;
};

export type CollapsibleDomElements = {
	root: HTMLElement;
	header: HTMLElement;
	body: HTMLElement;
	indicator: HTMLElement;
};

// Bond shape the atoms type against — breaks the atom↔bond cycle.
type CollapsibleBondView = ViewOf<CollapsibleState>;

export class CollapsibleRootAtom extends BondAtom<CollapsibleBondView> {
	constructor(bond: CollapsibleBondView) {
		super(bond, 'root');
	}
}

export class CollapsibleHeaderAtom extends BondAtom<CollapsibleBondView> {
	constructor(bond: CollapsibleBondView) {
		super(bond, 'header');
	}

	override get attrs() {
		const isDisabled = this.bond.state?.props?.disabled ?? false;
		const isButton = isBrowser() && this.element instanceof HTMLButtonElement;

		// aria-expanded/aria-controls come from the trigger↔content link; only button-vs-div semantics remain here.
		return {
			...super.attrs,
			'aria-disabled': isDisabled ? 'true' : 'false',
			disabled: isButton ? isDisabled : undefined,
			role: isButton ? undefined : 'button',
			tabindex: isButton ? undefined : isDisabled ? -1 : 0
		};
	}

	override get handlers() {
		return {
			onclick: () => {
				const isDisabled = this.bond.state?.props?.disabled ?? false;
				if (!isDisabled) {
					this.bond.state.toggle();
				}
			},
			onkeydown: (e: KeyboardEvent) => {
				const isDisabled = this.bond.state?.props?.disabled ?? false;
				if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
					e.preventDefault();
					this.bond.state.toggle();
				}
			}
		};
	}
}

export class CollapsibleBodyAtom extends BondAtom<CollapsibleBondView> {
	constructor(bond: CollapsibleBondView) {
		super(bond, 'body');
	}

	override get attrs() {
		const isOpen = this.bond.state?.props?.open ?? false;

		// aria-labelledby/role=region come from the trigger↔content link.
		return {
			...super.attrs,
			inert: isOpen ? undefined : true
		};
	}
}

export class CollapsibleIndicatorAtom extends BondAtom<CollapsibleBondView> {
	constructor(bond: CollapsibleBondView) {
		super(bond, 'indicator');
	}

	override get attrs() {
		return {
			...super.attrs,
			role: 'icon'
		};
	}
}

// Base captures the parent collapsible from context, enabling nesting.
class CollapsibleBondBase extends Bond<CollapsibleStateProps, CollapsibleState> {
	#parent: CollapsibleBond | undefined;

	constructor(state: CollapsibleState) {
		super(state, 'collapsible');
		this.#parent = CollapsibleBond.get();
	}

	get parent(): CollapsibleBond | undefined {
		return this.#parent;
	}
}

export const CollapsibleBond = defineBond<
	{
		root: typeof CollapsibleRootAtom;
		header: { atom: typeof CollapsibleHeaderAtom; role: 'trigger' };
		body: { atom: typeof CollapsibleBodyAtom; role: 'content' };
		indicator: typeof CollapsibleIndicatorAtom;
	},
	CollapsibleState,
	typeof CollapsibleBondBase
>({
	name: 'collapsible',
	base: CollapsibleBondBase,
	atoms: {
		root: CollapsibleRootAtom,
		header: { atom: CollapsibleHeaderAtom, role: 'trigger' },
		body: { atom: CollapsibleBodyAtom, role: 'content' },
		indicator: CollapsibleIndicatorAtom
	}
});

export type CollapsibleBond = BondOf<typeof CollapsibleBond>;

export class CollapsibleState extends DisclosureState<CollapsibleStateProps> {
	// Open/closed state is backed by props.open. isOpen/open/close/toggle are inherited.
	readonly disclosure: Disclosure = createDisclosure({
		get: () => this.props.open,
		set: (v) => (this.props.open = v)
	});

	constructor(props: CollapsibleStateProps) {
		super(props);
		this.capability(triggerContentLink(this.disclosure, { contentRole: 'region' }));
	}
}
