import { defineBond, internCapabilityFactory } from '@ixirjs/ui/shared';
import {
	ariaRole,
	createDisclosure,
	defineAtomCapability,
	disclosureCapability,
	disclosureTrigger,
	sharedCapabilityKey,
	triggerContentLink,
	type Disclosure,
	type DisclosureStateProps
} from '@ixirjs/ui/shared';
// Bond, defineAtom and AtomHost are classified experimental (ADR 0008): a bonded family cannot
// be authored from `/shared` alone. See "Authoring a bonded family" in that ADR.
import { Bond, defineAtom } from '$ixirjs/ui/shared/bond';
import type { AtomHost } from '$ixirjs/ui/shared/capability';
import { isBrowser } from '@ixirjs/ui/utils';

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

const COLLAPSIBLE_HEADER = sharedCapabilityKey<void>({
	owner: '@ixirjs/collapsible',
	name: 'header',
	version: 1
});
const COLLAPSIBLE_BODY = sharedCapabilityKey<void>({
	owner: '@ixirjs/collapsible',
	name: 'body',
	version: 1
});

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

const collapsibleHeaderPresentation = internCapabilityFactory(
	function collapsibleHeaderPresentation() {
		return defineAtomCapability<void, AtomHost, CollapsibleBondView>({
			slot: COLLAPSIBLE_HEADER,
			meta: {
				projects: ['header'],
				docs: 'Collapsible header button semantics and disabled projection.'
			},
			attach: {
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
			}
		});
	}
);

const collapsibleBodyPresentation = internCapabilityFactory(function collapsibleBodyPresentation() {
	return defineAtomCapability<void, AtomHost, CollapsibleBondView>({
		slot: COLLAPSIBLE_BODY,
		meta: {
			projects: ['body'],
			docs: 'Collapsible body inert projection while closed.'
		},
		attach: {
			attrs: (_node, bond) => ({
				// aria-labelledby/role=region come from the trigger-content relationship.
				inert: bond?.isOpen ? undefined : true
			})
		}
	});
});

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
	atoms: {
		root: CollapsibleRootAtom,
		header: { atom: CollapsibleHeaderAtom, role: 'trigger' },
		body: { atom: CollapsibleBodyAtom, role: 'content' },
		indicator: CollapsibleIndicatorAtom
	}
};

export const CollapsibleBond = defineBond(collapsibleSpec);

export type CollapsibleBond = CollapsibleBondBase;
