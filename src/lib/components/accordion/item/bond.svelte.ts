import { AccordionBond, type IAccordion } from '../bond.svelte';
import { Bond, defineAtom, type BondStateProps } from '$svelte-atoms/core/shared/bond';
import { defineBond, type BondOf } from '$svelte-atoms/core/shared';
import {
	defineAtomCapability,
	sharedCapabilityKey,
	type AtomHost
} from '$svelte-atoms/core/shared/capability';
import {
	createDisclosure,
	disclosureCapability,
	type Disclosure
} from '$svelte-atoms/core/shared/capability/models/disclosure.svelte';
import { triggerContentLink } from '$svelte-atoms/core/shared/capability/models/relationship.svelte';
import { isBrowser } from '$svelte-atoms/core/utils/dom.svelte';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type AccordionItemBondProps = BondStateProps & {
	value?: string;
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

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

export class AccordionItemBondBase extends Bond<AccordionItemBondProps> {
	#parent: IAccordion | undefined;

	// Disclosure over the item's open state, driven by the parent accordion's selection.
	#disclosure: Disclosure = createDisclosure({
		get: () => this.isOpen ?? false,
		set: (open) => (open ? this.open() : this.close())
	});

	constructor(props: AccordionItemBondProps) {
		super(props, 'accordion-item');
		this.#parent = AccordionBond.get();
		if (!this.#parent) {
			throw new Error('AccordionItemAtom must be used within an AccordionAtom context.');
		}
		this.capability(disclosureCapability(this.#disclosure));
		// trigger↔content a11y link: header gets aria-expanded/aria-controls, body gets aria-labelledby/role=region; ids resolved via the role registry.
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

	get isDisabled() {
		return this.props.disabled || this.parent?.isDisabled || false;
	}

	// Narrow parent contract, not the whole bond.
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

// -----------------------------------------------------------------------------
// Internal types
// -----------------------------------------------------------------------------

type AccordionItemBondView = AccordionItemBondBase;

// -----------------------------------------------------------------------------
// Capability slots and shared helpers
// -----------------------------------------------------------------------------

const ACCORDION_ITEM_ROOT = sharedCapabilityKey<void>('@svelte-atoms/accordion-item:root');
const ACCORDION_ITEM_HEADER = sharedCapabilityKey<void>('@svelte-atoms/accordion-item:header');
const ACCORDION_ITEM_BODY = sharedCapabilityKey<void>('@svelte-atoms/accordion-item:body');
const ACCORDION_ITEM_INDICATOR = sharedCapabilityKey<void>(
	'@svelte-atoms/accordion-item:indicator'
);

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

export const AccordionItemRootAtom = defineAtom<AccordionItemBondView>('root', (atom) => {
	atom.capability(accordionItemRegistration());
});
export type AccordionItemRootAtom = InstanceType<typeof AccordionItemRootAtom>;

export const AccordionItemHeaderAtom = defineAtom<AccordionItemBondView>('header', (atom) => {
	atom.capability(accordionItemHeaderPresentation());
});
export type AccordionItemHeaderAtom = InstanceType<typeof AccordionItemHeaderAtom>;

export const AccordionItemBodyAtom = defineAtom<AccordionItemBondView>('body', (atom) => {
	atom.capability(accordionItemBodyPresentation());
});
export type AccordionItemBodyAtom = InstanceType<typeof AccordionItemBodyAtom>;

export const AccordionItemIndicatorAtom = defineAtom<AccordionItemBondView>('indicator', (atom) => {
	atom.capability(accordionItemIndicatorPresentation());
});
export type AccordionItemIndicatorAtom = InstanceType<typeof AccordionItemIndicatorAtom>;

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function accordionItemRegistration() {
	return defineAtomCapability<void, AtomHost, AccordionItemBondView>({
		slot: ACCORDION_ITEM_ROOT,
		meta: {
			layer: 1,
			kind: 'effect',
			projects: ['root'],
			docs: 'Registers a mounted accordion item with its parent accordion collection.'
		},
		behavior: {
			onmount: (_element, _node, bond) => bond?.parent?.attachItem(bond.id, bond)
		}
	});
}

// -----------------------------------------------------------------------------
// Atom capabilities
// -----------------------------------------------------------------------------

function accordionItemHeaderPresentation() {
	return defineAtomCapability<void, AtomHost, AccordionItemBondView>({
		slot: ACCORDION_ITEM_HEADER,
		meta: {
			layer: 1,
			kind: 'projection',
			projects: ['header'],
			docs: 'Accordion item header button semantics and activation policy.'
		},
		behavior: {
			attrs: (node, bond) => {
				const isButtonElement = isBrowser() && node.element instanceof HTMLButtonElement;
				const isDisabled = bond?.isDisabled ?? false;
				const isActive = bond?.isActive ?? false;

				// aria-controls + aria-expanded come from the trigger↔content link.
				return {
					'aria-disabled': isDisabled,
					'aria-selected': isActive,
					role: isButtonElement ? undefined : 'button',
					tabindex: isActive ? 0 : -1,
					disabled: isButtonElement ? isDisabled : undefined
				};
			},
			handlers: (_node, bond) => ({
				onpointerdown: (ev: PointerEvent) => {
					if (!bond) return;
					if (bond.isDisabled) return;
					if (ev.defaultPrevented) return;

					if (bond.parent?.multiple) {
						bond.toggle();
					} else {
						if (bond.parent?.collapsible) {
							const values = bond.parent?.values ?? [];
							const isActive = bond.isActive;
							bond.parent?.close([...values]);
							if (!isActive) {
								bond.open();
							}
						} else {
							bond.open();
						}
					}
				}
			})
		}
	});
}

function accordionItemBodyPresentation() {
	return defineAtomCapability<void, AtomHost, AccordionItemBondView>({
		slot: ACCORDION_ITEM_BODY,
		meta: {
			layer: 1,
			kind: 'projection',
			projects: ['body'],
			docs: 'Accordion item body visibility projection.'
		},
		behavior: {
			attrs: (_node, bond) => ({
				// aria-labelledby + role=region come from the trigger↔content link.
				'aria-hidden': !bond?.isOpen
			})
		}
	});
}

function accordionItemIndicatorPresentation() {
	return defineAtomCapability<void, AtomHost, AccordionItemBondView>({
		slot: ACCORDION_ITEM_INDICATOR,
		meta: {
			layer: 1,
			kind: 'projection',
			projects: ['indicator'],
			docs: 'Accordion item indicator relationship metadata.'
		},
		behavior: {
			attrs: (_node, bond) => ({
				'data-controled-by': bond?.accordionId ?? ''
			})
		}
	});
}

// preset path `accordion.item` (dotted) is distinct from the DOM namespace `accordion-item`.

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

const AccordionItemBondImpl = defineBond<
	{
		root: typeof AccordionItemRootAtom;
		header: { atom: typeof AccordionItemHeaderAtom; role: 'trigger' };
		body: { atom: typeof AccordionItemBodyAtom; role: 'content' };
		indicator: typeof AccordionItemIndicatorAtom;
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	typeof AccordionItemBondBase
>({
	name: 'accordion-item',
	preset: 'accordion.item',
	base: AccordionItemBondBase,
	atoms: {
		root: AccordionItemRootAtom,
		header: { atom: AccordionItemHeaderAtom, role: 'trigger' },
		body: { atom: AccordionItemBodyAtom, role: 'content' },
		indicator: AccordionItemIndicatorAtom
	}
});

export type AccordionItemBond = BondOf<typeof AccordionItemBondImpl>;

interface AccordionItemBondConstructor {
	new (props: AccordionItemBondProps): AccordionItemBond;
	readonly CONTEXT_KEY: string;
	readonly spec: (typeof AccordionItemBondImpl)['spec'];
	get(): AccordionItemBond | undefined;
	getOrThrow(message?: string): AccordionItemBond;
	set(bond: AccordionItemBond): AccordionItemBond;
	create(props: AccordionItemBondProps): AccordionItemBond;
}

export const AccordionItemBond = AccordionItemBondImpl as unknown as AccordionItemBondConstructor;
