import { AccordionBond, type IAccordion } from '$ixirjs/ui/components/accordion/bond.svelte';
import { Bond, defineAtom, type BondStateProps } from '$ixirjs/ui/shared/bond';
import { defineBond, type BondOf } from '$ixirjs/ui/shared';
import {
	createDisclosure,
	disclosureCapability,
	type Disclosure
} from '$ixirjs/ui/shared/capability/models/disclosure.svelte';
import { triggerContentLink } from '$ixirjs/ui/shared/capability/models/relationship.svelte';
import { isBrowser } from '$ixirjs/ui/utils/dom.svelte';

export type AccordionItemBondProps = BondStateProps & {
	value?: string;
	disabled: boolean;
	multiple: boolean;
	collapsible: boolean;
	data?: unknown;
};

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
		// Same capability instances as the parent's — the header atom projects them under
		// role 'header' (arrow/Home/End keydown lives on the header, not on the root container).
		for (const capability of this.#parent.keyboardCapabilities()) this.capability(capability);
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

export const AccordionItemRootAtom = defineAtom<AccordionItemBondBase>('root', {
	slot: '@ixirjs/accordion-item:root',
	docs: 'Registers a mounted accordion item with its parent accordion collection.',
	onmount: (_element, _node, bond) => bond?.parent?.attachItem(bond.id, bond)
});

export const AccordionItemHeaderAtom = defineAtom<AccordionItemBondBase>('header', {
	slot: '@ixirjs/accordion-item:header',
	docs: 'Accordion item header button semantics and activation policy.',
	attrs: (node, bond) => {
		const isButtonElement = isBrowser() && node.element instanceof HTMLButtonElement;
		const isDisabled = bond?.isDisabled ?? false;
		const isActive = bond?.isActive ?? false;

		// aria-controls + aria-expanded come from the trigger↔content link.
		return {
			'aria-disabled': isDisabled,
			'aria-selected': isActive,
			role: isButtonElement ? undefined : 'button',
			// Roving tabindex over the headers — the focused header, not the open one. Keying it to
			// `isActive` left a fully-collapsed accordion with no tabbable header at all.
			tabindex: bond?.parent?.focusedId === bond?.id ? 0 : -1,
			disabled: isButtonElement ? isDisabled : undefined
		};
	},
	setup: (atom) => atom.role('header'),
	handlers: (_node, bond) => ({
		onfocus: () => {
			if (bond) bond.parent?.notifyFocused(bond.id);
		},
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
});

export const AccordionItemBodyAtom = defineAtom<AccordionItemBondBase>('body', {
	slot: '@ixirjs/accordion-item:body',
	docs: 'Accordion item body visibility projection.',
	attrs: (_node, bond) => ({
		// aria-labelledby + role=region come from the trigger↔content link.
		'aria-hidden': !bond?.isOpen
	})
});

export const AccordionItemIndicatorAtom = defineAtom<AccordionItemBondBase>('indicator', {
	slot: '@ixirjs/accordion-item:indicator',
	docs: 'Accordion item indicator relationship metadata.',
	attrs: (_node, bond) => ({
		'data-controled-by': bond?.accordionId ?? ''
	})
});

// preset path `accordion.item` (dotted) is distinct from the DOM namespace `accordion-item`.

export const AccordionItemBond = defineBond({
	name: 'accordion-item',
	preset: 'accordion.item',
	base: AccordionItemBondBase,
	atoms: {
		root: { atom: AccordionItemRootAtom },
		header: { atom: AccordionItemHeaderAtom, role: 'trigger' },
		body: { atom: AccordionItemBodyAtom, role: 'content' },
		indicator: AccordionItemIndicatorAtom
	}
});

export type AccordionItemBond = BondOf<typeof AccordionItemBond>;
