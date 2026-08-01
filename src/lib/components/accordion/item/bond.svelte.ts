import { AccordionBond, type IAccordion } from '../bond.svelte';
import { BondState, BondAtom, type BondStateProps } from '$svelte-atoms/core/shared/bond.svelte';
import { defineBond, type BondOf, type ViewOf } from '$svelte-atoms/core/shared';
import {
	createDisclosure,
	type Disclosure
} from '$svelte-atoms/core/shared/capabilities/disclosure.svelte';
import { triggerContentLink } from '$svelte-atoms/core/shared/capabilities/relationship.svelte';
import { isBrowser } from '$svelte-atoms/core/utils/dom.svelte';

export type AccordionItemBondProps = BondStateProps & {
	value: string;
	disabled: boolean;
	multiple: boolean;
	collapsible: boolean;
	data?: unknown;
};

export type AccordionItemBondElements = {
	root: HTMLElement;
	header: HTMLElement;
	body: HTMLElement;
	indicator: HTMLElement;
};

// Bond view the item atoms type against — breaks the atom↔bond cycle via defineBond (§12.2).
type AccordionItemBondView = ViewOf<AccordionItemBondState>;

export class AccordionItemRootAtom extends BondAtom<AccordionItemBondView> {
	constructor(bond: AccordionItemBondView) {
		super(bond, 'root');
	}

	override get attrs() {
		return {
			...super.attrs
		};
	}

		// Register into parent accordion's item collection on mount; cleanup unregisters on destroy.
	// Attached from the atom (not state.mount()) so the collection holds the real bond.
	override onmount() {
		// `this.bond` is the view; the runtime instance is the full bond the collection holds.
		return this.bond.state.parent?.attachItem(this.bond.id, this.bond as AccordionItemBond);
	}
}

export class AccordionItemHeaderAtom extends BondAtom<AccordionItemBondView> {
	constructor(bond: AccordionItemBondView) {
		super(bond, 'header');
	}

	override get attrs() {
		const isButtonElement = isBrowser() ? this.element instanceof HTMLButtonElement : false;

		const props = this.bond.state?.props;
		const isDisabled = props?.disabled ?? false;
		const isActive = this.bond.state?.isActive ?? false;

		// aria-controls + aria-expanded come from the trigger↔content link (role:'trigger').
		return {
			...super.attrs,
			'aria-disabled': isDisabled,
			'aria-selected': isActive,
			role: isButtonElement ? undefined : 'button',
			tabindex: isActive ? 0 : -1,
			disabled: isButtonElement ? isDisabled : undefined
		};
	}

	override get handlers() {
		return {
			onpointerdown: (ev: PointerEvent) => {
				const props = this.bond.state?.props;
				const isDisabled = props?.disabled ?? false;
				const isMultiple = props?.multiple ?? false;
				const isCollapsible = props?.collapsible ?? false;

				if (isDisabled) return;
				if (ev.defaultPrevented) return;

				if (isMultiple) {
					this.bond.state.toggle();
				} else {
					if (isCollapsible) {
						const values = this.bond.state.parent?.values ?? [];
						const isActive = this.bond.state.isActive;
						this.bond.state.parent?.close([...values]);
						if (!isActive) {
							this.bond.state.open();
						}
					} else {
						this.bond.state.open();
					}
				}
			}
		};
	}
}

export class AccordionItemBodyAtom extends BondAtom<AccordionItemBondView> {
	constructor(bond: AccordionItemBondView) {
		super(bond, 'body');
	}

	override get attrs() {
		// aria-labelledby + role=region come from the trigger↔content link (role:'content').
		return {
			...super.attrs,
			'aria-hidden': !this.bond.state?.isOpen
		};
	}
}

export class AccordionItemIndicatorAtom extends BondAtom<AccordionItemBondView> {
	constructor(bond: AccordionItemBondView) {
		super(bond, 'indicator');
	}

	override get attrs() {
		return {
			...super.attrs,
			'data-controled-by': this.bond.state?.accordionId ?? ''
		};
	}
}

// AccordionItemBond via defineBond (§6). header/body carry trigger↔content roles;
// preset path is `accordion.item` (dotted), distinct from the DOM namespace `accordion-item`.
export const AccordionItemBond = defineBond<
	{
		root: typeof AccordionItemRootAtom;
		header: { atom: typeof AccordionItemHeaderAtom; role: 'trigger' };
		body: { atom: typeof AccordionItemBodyAtom; role: 'content' };
		indicator: typeof AccordionItemIndicatorAtom;
	},
	AccordionItemBondState
>({
	name: 'accordion-item',
	preset: 'accordion.item',
	atoms: {
		root: AccordionItemRootAtom,
		header: { atom: AccordionItemHeaderAtom, role: 'trigger' },
		body: { atom: AccordionItemBodyAtom, role: 'content' },
		indicator: AccordionItemIndicatorAtom
	}
});

// Instance type of the accordion-item bond — paired with the const above.
export type AccordionItemBond = BondOf<typeof AccordionItemBond>;

export class AccordionItemBondState extends BondState<AccordionItemBondProps> {
	#parent: IAccordion | undefined;

	// Disclosure over the item's open state, driven by the parent accordion's selection.
	#disclosure: Disclosure = createDisclosure({
		get: () => this.isOpen ?? false,
		set: (open) => (open ? this.open() : this.close())
	});

	constructor(props: AccordionItemBondProps) {
		super(props);
		this.#parent = AccordionBond.get()?.state;
		if (!this.#parent) {
			throw new Error('AccordionItemAtom must be used within an AccordionAtom context.');
		}
		// trigger↔content a11y link (§11.3): header (role:'trigger') gets aria-expanded +
		// aria-controls; body (role:'content') gets aria-labelledby + role=region. Ids
		// resolved via the role registry, replacing the hand-wired `accordion-*-${id}`.
		this.capability(triggerContentLink(this.#disclosure, { contentRole: 'region' }));
	}

	get id() {
		return this.props.value ?? super.id;
	}

	get accordionId() {
		return this.parent?.id;
	}

	get isOpen() {
		return this.parent?.values.includes(this.id);
	}

	get isActive() {
		return (
			!this.props.disabled && !this.parent?.isDisabled && this.parent?.values.includes(this.id)
		);
	}

	// The narrow parent contract this item depends on (not the whole bond).
	get parent(): IAccordion | undefined {
		return this.#parent;
	}

	open() {
		this.parent?.open([this.id]);
	}

	close() {
		this.parent?.close([this.id]);
	}

	toggle() {
		this.parent?.toggle(this.id);
	}
}
