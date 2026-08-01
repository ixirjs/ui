import { Bond, defineAtom } from '$svelte-atoms/core/shared/bond';
import { defineBond, type BondSpec } from '$svelte-atoms/core/shared';
import {
	ariaRole,
	defineAtomCapability,
	sharedCapabilityKey,
	type AtomHost
} from '$svelte-atoms/core/shared/capability';
import {
	createDisclosure,
	disclosureCapability,
	disclosureTrigger,
	type Disclosure
} from '$svelte-atoms/core/shared/capability/models/disclosure.svelte';
import type { DisclosureStateProps } from '$svelte-atoms/core/shared/capability/models/disclosure-state.svelte';
import { triggerContentLink } from '$svelte-atoms/core/shared/capability/models/relationship.svelte';
import { isBrowser } from '$svelte-atoms/core/utils/dom.svelte';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Internal types
// -----------------------------------------------------------------------------

type CollapsibleBondView = CollapsibleBondBase;

// -----------------------------------------------------------------------------
// Capability slots and shared helpers
// -----------------------------------------------------------------------------

const COLLAPSIBLE_HEADER = sharedCapabilityKey<void>('@svelte-atoms/collapsible:header');
const COLLAPSIBLE_BODY = sharedCapabilityKey<void>('@svelte-atoms/collapsible:body');

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

export const CollapsibleRootAtom = defineAtom<CollapsibleBondView>('root');
export type CollapsibleRootAtom = InstanceType<typeof CollapsibleRootAtom>;

export const CollapsibleHeaderAtom = defineAtom<CollapsibleBondView>('header', (atom) => {
	atom.capability(collapsibleHeaderPresentation());
});
export type CollapsibleHeaderAtom = InstanceType<typeof CollapsibleHeaderAtom>;

export const CollapsibleBodyAtom = defineAtom<CollapsibleBondView>('body', (atom) => {
	atom.capability(collapsibleBodyPresentation());
});
export type CollapsibleBodyAtom = InstanceType<typeof CollapsibleBodyAtom>;

export const CollapsibleIndicatorAtom = defineAtom<CollapsibleBondView>('indicator', (atom) => {
	atom.capability(ariaRole('icon'));
});
export type CollapsibleIndicatorAtom = InstanceType<typeof CollapsibleIndicatorAtom>;

// -----------------------------------------------------------------------------
// Atom capabilities
// -----------------------------------------------------------------------------

function collapsibleHeaderPresentation() {
	return defineAtomCapability<void, AtomHost, CollapsibleBondView>({
		slot: COLLAPSIBLE_HEADER,
		meta: {
			layer: 1,
			kind: 'projection',
			projects: ['header'],
			docs: 'Collapsible header button semantics and disabled projection.'
		},
		behavior: {
			attrs: (node, bond) => {
				const isDisabled = bond?.state?.props?.disabled ?? false;
				const isButton = isBrowser() && node.element instanceof HTMLButtonElement;

				// aria-expanded/aria-controls come from the trigger-content relationship.
				return {
					'aria-disabled': isDisabled ? 'true' : 'false',
					disabled: isButton ? isDisabled : undefined,
					role: isButton ? undefined : 'button',
					tabindex: isButton ? undefined : isDisabled ? -1 : 0
				};
			}
		}
	});
}

function collapsibleBodyPresentation() {
	return defineAtomCapability<void, AtomHost, CollapsibleBondView>({
		slot: COLLAPSIBLE_BODY,
		meta: {
			layer: 1,
			kind: 'projection',
			projects: ['body'],
			docs: 'Collapsible body inert projection while closed.'
		},
		behavior: {
			attrs: (_node, bond) => ({
				// aria-labelledby/role=region come from the trigger-content relationship.
				inert: bond?.state?.props?.open ? undefined : true
			})
		}
	});
}

// Base captures the parent collapsible from context, enabling nesting.

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

class CollapsibleBondBase extends Bond<CollapsibleStateProps> {
	#parent: CollapsibleBond | undefined;

	// Open/closed state is backed by props.open.
	readonly disclosure: Disclosure = createDisclosure({
		get: () => this.props.open,
		set: (v) => (this.props.open = v)
	});

	constructor(props: CollapsibleStateProps, name = 'collapsible') {
		super(props, name);
		this.#parent = getOptionalParentCollapsible();
		this.capability(disclosureCapability(this.disclosure));
		this.capability(triggerContentLink(this.disclosure, { contentRole: 'region' }));
		this.capability(disclosureTrigger());
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

	get parent(): CollapsibleBond | undefined {
		return this.#parent;
	}
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function getOptionalParentCollapsible(): CollapsibleBond | undefined {
	try {
		return CollapsibleBond.get();
	} catch {
		return undefined;
	}
}

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

const collapsibleSpec = {
	name: 'collapsible',
	base: CollapsibleBondBase,
	atomMethods: false,
	atoms: {
		root: CollapsibleRootAtom,
		header: { atom: CollapsibleHeaderAtom, role: 'trigger' },
		body: { atom: CollapsibleBodyAtom, role: 'content' },
		indicator: CollapsibleIndicatorAtom
	}
} satisfies BondSpec<
	{
		root: typeof CollapsibleRootAtom;
		header: { atom: typeof CollapsibleHeaderAtom; role: 'trigger' };
		body: { atom: typeof CollapsibleBodyAtom; role: 'content' };
		indicator: typeof CollapsibleIndicatorAtom;
	},
	typeof CollapsibleBondBase
> & { atomMethods: false };

const CollapsibleBondImpl = defineBond<
	{
		root: typeof CollapsibleRootAtom;
		header: { atom: typeof CollapsibleHeaderAtom; role: 'trigger' };
		body: { atom: typeof CollapsibleBodyAtom; role: 'content' };
		indicator: typeof CollapsibleIndicatorAtom;
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	typeof CollapsibleBondBase,
	Record<never, never>,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	Record<never, never>,
	false
>(collapsibleSpec);

export type CollapsibleBond = CollapsibleBondBase;

interface CollapsibleBondConstructor {
	new (props: CollapsibleStateProps): CollapsibleBond;
	readonly CONTEXT_KEY: string;
	readonly spec: (typeof CollapsibleBondImpl)['spec'];
	get(): CollapsibleBond | undefined;
	getOrThrow(message?: string): CollapsibleBond;
	set(bond: CollapsibleBond): CollapsibleBond;
	create(props: CollapsibleStateProps): CollapsibleBond;
}

export const CollapsibleBond = CollapsibleBondImpl as unknown as CollapsibleBondConstructor;
