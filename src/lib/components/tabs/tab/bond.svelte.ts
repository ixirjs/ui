import { TabsBond, type ITabs } from '../bond.svelte';
import { portal } from '$svelte-atoms/core/attachments/portal.svelte';
import { Bond, defineAtom, type BondStateProps } from '$svelte-atoms/core/shared/bond';
import { defineBond, type BondOf } from '$svelte-atoms/core/shared';
import {
	defineAtomCapability,
	sharedCapabilityKey,
	type AtomHost
} from '$svelte-atoms/core/shared/capability';
import { tabPanelLink } from '$svelte-atoms/core/shared/capability/models/relationship.svelte';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type TabBondProps<
	T,
	S extends Record<string, unknown> = Record<string, unknown>
> = BondStateProps & {
	value: string;
	disabled?: boolean;
	data: T;
	extend: S;
};

export type TabBondElement = {
	header: HTMLElement;
	body: HTMLElement;
	description: HTMLElement;
};

// -----------------------------------------------------------------------------
// Capability slots and shared helpers
// -----------------------------------------------------------------------------

const TAB_HEADER = sharedCapabilityKey<void>('@svelte-atoms/tab:header');
const TAB_BODY = sharedCapabilityKey<void>('@svelte-atoms/tab:body');

// Atoms type `this.bond` against TabBondBase to break the atom<->bond cycle.

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

export const TabHeaderAtom = defineAtom<TabBondBase>('header', (atom, bond) => {
	// `role('item', value)` opts this header into the parent's selection capability.
	atom.role('item', bond.value);
	atom.role('tab');
	atom.capability(tabHeaderPresentation());
});
export type TabHeaderAtom = InstanceType<typeof TabHeaderAtom>;

export const TabBodyAtom = defineAtom<TabBondBase>('body', (atom) => {
	atom.role('tabpanel');
	atom.capability(tabBodyPresentation());
});
export type TabBodyAtom = InstanceType<typeof TabBodyAtom>;

export const TabDescriptionAtom = defineAtom<TabBondBase>('description');
export type TabDescriptionAtom = InstanceType<typeof TabDescriptionAtom>;

// -----------------------------------------------------------------------------
// Atom capabilities
// -----------------------------------------------------------------------------

function tabHeaderPresentation() {
	return defineAtomCapability<void, AtomHost, TabBondBase>({
		slot: TAB_HEADER,
		meta: {
			layer: 1,
			kind: 'projection',
			projects: ['header'],
			docs: 'Tab header selected/disabled projection, activation, and header portal.'
		},
		behavior: {
			attrs: (_node, bond) => ({
				'aria-disabled': bond?.props.disabled ?? false,
				'data-controler-id': bond?.tabs?.id,
				'data-active': bond?.isActive
			}),
			handlers: (_node, bond) => ({
				onclick: () => {
					if (bond?.props.disabled) return;
					bond?.select();
				}
			}),
			onmount: (node, _host, bond) => {
				const headerElement = bond?.tabs?.headerElement;

				if (typeof HTMLElement === 'undefined' || !(node instanceof HTMLElement)) return;

				if (!headerElement) {
					node.hidden = true;
					return;
				}

				return portal(headerElement)(node);
			}
		}
	});
}

function tabBodyPresentation() {
	return defineAtomCapability<void, AtomHost, TabBondBase>({
		slot: TAB_BODY,
		meta: {
			layer: 1,
			kind: 'projection',
			projects: ['body'],
			docs: 'Tab body active-state projection.'
		},
		behavior: {
			attrs: (_node, bond) => ({
				'data-active': bond?.isActive
			})
		}
	});
}

// Hand-written base for TabBond. Parent-tabs capture, selection projection,
// and value/text/mount helpers live on the Bond instance.

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

class TabBondBase extends Bond<TabBondProps<unknown>> {
	#parent: ITabs | undefined;

	constructor(props: TabBondProps<unknown>, name = 'tab') {
		super(props, name);
		this.#parent = TabsBond.get();

		// Re-register the parent's selection capability on this child bond so the tab-header
		// atom can project it via `.role('item', value)`. Same instance, shared surface.
		const selection = this.#parent?.selectionCapability();
		if (selection) this.capability(selection);
		this.capability(tabPanelLink({ selected: () => this.isActive }));
	}

	get tabs(): ITabs | undefined {
		return this.#parent;
	}

	get value() {
		return this.props.value;
	}

	get text() {
		return (this.elements?.header as HTMLElement | undefined)?.innerText ?? '';
	}

	get isActive() {
		return this.#parent?.activeValue === this.props.value;
	}

	get isDisabled() {
		return (
			this.props.disabled ?? this.#parent?.headerElement?.getAttribute?.('aria-disabled') === 'true'
		);
	}

	mount() {
		return this.#parent?.mountItem(this.value, this as unknown as TabBond);
	}

	unmount() {
		this.#parent?.unmountItem(this.id);
	}

	select() {
		this.#parent?.select(this.props.value);
	}

	unselect() {
		this.#parent?.unselect();
	}
}

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

const TabBondImpl = defineBond<
	{
		header: typeof TabHeaderAtom;
		body: typeof TabBodyAtom;
		description: typeof TabDescriptionAtom;
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	typeof TabBondBase
>({
	name: 'tab',
	base: TabBondBase,
	atoms: {
		header: TabHeaderAtom,
		body: TabBodyAtom,
		description: TabDescriptionAtom
	}
});

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type TabBond<T = unknown> = BondOf<typeof TabBondImpl> & {
	readonly props: TabBondProps<T>;
	readonly tabs: ITabs<T> | undefined;
};

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

interface TabBondConstructor {
	new <T = unknown>(props: TabBondProps<T>): TabBond<T>;
	readonly CONTEXT_KEY: string;
	get<T = unknown>(): TabBond<T> | undefined;
	getOrThrow<T = unknown>(message?: string): TabBond<T>;
	set<T = unknown>(bond: TabBond<T>): TabBond<T>;
	create<T = unknown>(props: TabBondProps<T>): TabBond<T>;
}

export const TabBond = TabBondImpl as unknown as TabBondConstructor;
