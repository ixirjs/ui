import { Bond, BondState, BondAtom, type BondStateProps } from '$svelte-atoms/core/shared/bond.svelte';
import { defineBond, type BondOf, type ViewOf } from '$svelte-atoms/core/shared';
import {
	createDisclosure,
	type Disclosure
} from '$svelte-atoms/core/shared/capabilities/disclosure.svelte';
import { triggerContentLink } from '$svelte-atoms/core/shared/capabilities/relationship.svelte';
import { isBrowser } from '$svelte-atoms/core/utils/dom.svelte';

export type CollapsibleStateProps = BondStateProps & {
	open: boolean;
	disabled: boolean;
	value?: string;
	data?: unknown;
	readonly rest?: Record<string, unknown>;
};

export type CollapsibleDomElements = {
	root: HTMLElement;
	header: HTMLElement;
	body: HTMLElement;
	indicator: HTMLElement;
};

// Bond shape the collapsible atoms type this.bond against — breaks the atom↔bond cycle.
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

		// `aria-expanded` + `aria-controls` come from the trigger↔content link
		// (role:'trigger'); only the button-vs-div semantics remain component-specific.
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

		// aria-labelledby + role=region come from the trigger↔content link (role:'content').
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

// Hand-written base for CollapsibleBond — captures parent from context for nesting.
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

// CollapsibleBond via defineBond over CollapsibleBondBase; trigger↔content link applied via atom roles.
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

// Instance type of the collapsible bond — paired with the const above.
export type CollapsibleBond = BondOf<typeof CollapsibleBond>;

export class CollapsibleState extends BondState<CollapsibleStateProps> {
	// Disclosure capability; open/closed state stored in props.open.
	#disclosure: Disclosure = createDisclosure({
		get: () => this.props.open,
		set: (v) => (this.props.open = v)
	});

	constructor(props: CollapsibleStateProps) {
		super(props);
		// Projects aria-expanded/aria-controls onto header and aria-labelledby/role=region onto body.
		this.capability(triggerContentLink(this.#disclosure, { contentRole: 'region' }));
	}

	get disclosure(): Disclosure {
		return this.#disclosure;
	}

	get isOpen() {
		return this.#disclosure.isOpen;
	}

	open() {
		this.#disclosure.open();
	}

	close() {
		this.#disclosure.close();
	}

	toggle() {
		this.#disclosure.toggle();
	}
}
