import { AccordionBond, type IAccordion } from '$ixirjs/ui/components/accordion/bond.svelte';
import { internCapabilityFactory } from '$ixirjs/ui/shared/capability/intern';
import { Bond, defineAtom, type BondStateProps } from '$ixirjs/ui/shared/bond';
import { defineBond, type BondOf } from '$ixirjs/ui/shared';
import {
	defineAtomCapability,
	sharedCapabilityKey,
	type AtomHost
} from '$ixirjs/ui/shared/capability';
import {
	createDisclosure,
	disclosureCapability,
	type Disclosure
} from '$ixirjs/ui/shared/capability/models/disclosure.svelte';
import { triggerContentLink } from '$ixirjs/ui/shared/capability/models/relationship.svelte';
import { isBrowser } from '$ixirjs/ui/utils/dom.svelte';

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
		this.capability(triggerContentLink({ contentRole: 'region' }));
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

const ACCORDION_ITEM_ROOT = sharedCapabilityKey<void>({
	owner: '@ixirjs/accordion-item',
	name: 'root',
	version: 1
});
const ACCORDION_ITEM_HEADER = sharedCapabilityKey<void>({
	owner: '@ixirjs/accordion-item',
	name: 'header',
	version: 1
});
const ACCORDION_ITEM_BODY = sharedCapabilityKey<void>({
	owner: '@ixirjs/accordion-item',
	name: 'body',
	version: 1
});
const ACCORDION_ITEM_INDICATOR = sharedCapabilityKey<void>({
	owner: '@ixirjs/accordion-item',
	name: 'indicator',
	version: 1
});

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

const accordionItemRegistration = internCapabilityFactory(function accordionItemRegistration() {
	return defineAtomCapability<void, AtomHost, AccordionItemBondView>({
		slot: ACCORDION_ITEM_ROOT,
		meta: {
			projects: ['root'],
			docs: 'Registers a mounted accordion item with its parent accordion collection.'
		},
		attach: {
			onmount: (_element, _node, bond) => bond?.parent?.attachItem(bond.id, bond)
		}
	});
});

// -----------------------------------------------------------------------------
// Atom capabilities
// -----------------------------------------------------------------------------

const accordionItemHeaderPresentation = internCapabilityFactory(
	function accordionItemHeaderPresentation() {
		return defineAtomCapability<void, AtomHost, AccordionItemBondView>({
			slot: ACCORDION_ITEM_HEADER,
			meta: {
				projects: ['header'],
				docs: 'Accordion item header button semantics and activation policy.'
			},
			attach: {
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
);

const accordionItemBodyPresentation = internCapabilityFactory(
	function accordionItemBodyPresentation() {
		return defineAtomCapability<void, AtomHost, AccordionItemBondView>({
			slot: ACCORDION_ITEM_BODY,
			meta: {
				projects: ['body'],
				docs: 'Accordion item body visibility projection.'
			},
			attach: {
				attrs: (_node, bond) => ({
					// aria-labelledby + role=region come from the trigger↔content link.
					'aria-hidden': !bond?.isOpen
				})
			}
		});
	}
);

const accordionItemIndicatorPresentation = internCapabilityFactory(
	function accordionItemIndicatorPresentation() {
		return defineAtomCapability<void, AtomHost, AccordionItemBondView>({
			slot: ACCORDION_ITEM_INDICATOR,
			meta: {
				projects: ['indicator'],
				docs: 'Accordion item indicator relationship metadata.'
			},
			attach: {
				attrs: (_node, bond) => ({
					'data-controled-by': bond?.accordionId ?? ''
				})
			}
		});
	}
);

// preset path `accordion.item` (dotted) is distinct from the DOM namespace `accordion-item`.

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

export const AccordionItemBond = defineBond({
	name: 'accordion-item',
	preset: 'accordion.item',
	base: AccordionItemBondBase,
	atoms: {
		root: { atom: AccordionItemRootAtom, selfLayer: true },
		header: { atom: AccordionItemHeaderAtom, role: 'trigger' },
		body: { atom: AccordionItemBodyAtom, role: 'content' },
		indicator: AccordionItemIndicatorAtom
	}
});

export type AccordionItemBond = BondOf<typeof AccordionItemBond>;
