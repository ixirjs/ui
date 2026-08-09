import { TabsBond, type ITabs } from '$ixirjs/ui/components/tabs/bond.svelte';
import { portal } from '$ixirjs/ui/attachments/portal.svelte';
import { Bond, defineAtom, type BondStateProps } from '$ixirjs/ui/shared/bond';
import { defineBond, type BondOf } from '$ixirjs/ui/shared';
import { tabPanelLink } from '$ixirjs/ui/shared/capability/models/relationship.svelte';

export type TabBondProps<
	T,
	S extends Record<string, unknown> = Record<string, unknown>
> = BondStateProps & {
	value: string;
	disabled?: boolean;
	data: T;
	extend: S;
};

// Atoms type `this.bond` against TabBondBase to break the atom<->bond cycle.

export const TabHeaderAtom = defineAtom<TabBondBase>('header', {
	slot: '@ixirjs/tab:header',
	docs: 'Tab header selected/disabled projection, activation, and header portal.',
	attrs: (_node, bond) => ({
		'aria-disabled': bond?.props.disabled ?? false,
		'data-controler-id': bond?.tabs?.id,
		'data-active': bond?.isActive,
		// Roving tabindex (APG tabs): Tab enters the tablist once, arrows move between tabs.
		tabindex: bond?.isActive ? 0 : -1
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
	},
	// `role('item', value)` opts this header into the parent's selection capability.
	setup: (atom, bond) => {
		atom.role('item', bond?.value);
		atom.role('tab');
	}
});

export const TabBodyAtom = defineAtom<TabBondBase>('body', {
	slot: '@ixirjs/tab:body',
	docs: 'Tab body active-state projection.',
	attrs: (_node, bond) => ({
		'data-active': bond?.isActive
	}),
	setup: (atom) => atom.role('tabpanel')
});

export const TabDescriptionAtom = defineAtom<TabBondBase>('description');

// Hand-written base for TabBond. Parent-tabs capture, selection projection,
// and value/text/mount helpers live on the Bond instance.

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

export const TabBond = defineBond({
	name: 'tab',
	base: TabBondBase,
	atoms: {
		header: TabHeaderAtom,
		body: TabBodyAtom,
		description: TabDescriptionAtom
	}
});

export type TabBond<T = unknown> = BondOf<typeof TabBond> & {
	readonly props: TabBondProps<T>;
	readonly tabs: ITabs<T> | undefined;
};
