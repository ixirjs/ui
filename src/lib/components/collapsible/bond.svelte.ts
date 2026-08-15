import { defineBond } from '$ixirjs/ui/shared';
import {
	createDisclosure,
	disclosureCapability,
	disclosureTrigger,
	triggerContentLink,
	type Disclosure,
	type DisclosureStateProps
} from '$ixirjs/ui/shared';
// Bond, defineAtom and AtomHost are classified experimental (ADR 0008): a bonded family cannot
// be authored from `/shared` alone. See "Authoring a bonded family" in that ADR.
import { Bond, defineAtom } from '$ixirjs/ui/shared/bond';
import { isBrowser } from '$ixirjs/ui/utils/dom.svelte';

export type CollapsibleStateProps = DisclosureStateProps & {
	value?: string;
	data?: unknown;
};

export const CollapsibleRootAtom = defineAtom<CollapsibleBondBase>('root');

export const CollapsibleHeaderAtom = defineAtom<CollapsibleBondBase>('header', {
	slot: '@ixirjs/collapsible:header',
	docs: 'Collapsible header button semantics and disabled projection.',
	attrs: (node, bond) => {
		const isDisabled = bond?.isDisabled ?? false;
		const isButton = isBrowser() && node.element instanceof HTMLButtonElement;

		// aria-expanded/aria-controls come from the trigger-content relationship.
		return {
			'aria-disabled': isDisabled ? 'true' : 'false',
			disabled: isButton ? isDisabled : undefined,
			role: isButton ? undefined : 'button',
			tabindex: isButton ? undefined : isDisabled ? -1 : 0
		};
	}
});

export const CollapsibleBodyAtom = defineAtom<CollapsibleBondBase>('body', {
	slot: '@ixirjs/collapsible:body',
	docs: 'Collapsible body inert projection while closed.',
	attrs: (_node, bond) => ({
		// aria-labelledby/role=region come from the trigger-content relationship.
		inert: bond?.isOpen ? undefined : true
	})
});

export const CollapsibleIndicatorAtom = defineAtom<CollapsibleBondBase>('indicator', {
	role: 'icon'
});

// Base captures the parent collapsible from context, enabling nesting.

class CollapsibleBondBase extends Bond<CollapsibleStateProps> {
	#parent: CollapsibleBond | undefined;

	// Open/closed state is backed by props.open.
	readonly disclosure: Disclosure = createDisclosure({
		get: () => this.props.open,
		set: (v) => (this.props.open = v)
	});

	constructor(props: CollapsibleStateProps, name = 'collapsible') {
		super(props, name);
		this.#parent = CollapsibleBond.getOptional();
		this.capability(disclosureCapability(this.disclosure));
		this.capability(triggerContentLink({ contentRole: 'region' }));
		this.capability(disclosureTrigger());
	}

	get isOpen(): boolean {
		return this.disclosure.isOpen;
	}

	get isDisabled(): boolean {
		return this.props.disabled ?? false;
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

	get parent(): CollapsibleBond | undefined {
		return this.#parent;
	}
}

const collapsibleSpec = {
	name: 'collapsible',
	base: CollapsibleBondBase,
	atoms: {
		root: CollapsibleRootAtom,
		header: { atom: CollapsibleHeaderAtom, role: 'trigger' },
		body: { atom: CollapsibleBodyAtom, role: 'content' },
		indicator: CollapsibleIndicatorAtom
	}
};

export const CollapsibleBond = defineBond(collapsibleSpec);

export type CollapsibleBond = CollapsibleBondBase;
