import { untrack } from 'svelte';
import { TabsBond, type ITabs } from '../bond.svelte';
import { getElementId } from '$svelte-atoms/core/utils/dom.svelte';
import { portal } from '$svelte-atoms/core/attachments/portal.svelte';
import { Bond, BondState, BondAtom, type BondStateProps } from '$svelte-atoms/core/shared/bond.svelte';
import { defineBond, type BondOf } from '$svelte-atoms/core/shared';

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

// Bond shape the tab atoms type `this.bond` against — breaks the atom↔bond cycle via `defineBond`.
class TabHeaderAtom extends BondAtom<TabBondBase, HTMLElement> {
	constructor(bond: TabBondBase) {
		super(bond, 'header');
		// `role('item', value)` opts this header into the parent's selection capability.
		this.role('item', bond.value);
	}
	override get attrs() {
		const bond = this.bond;
		const state = untrack(() => bond.state);
		const props = untrack(() => state.props);

		const tabBodyId = getElementId(bond.id, 'tab-body');
		return {
			...super.attrs,
			role: 'tab' as const,
			'aria-controls': tabBodyId,
			'aria-disabled': props.disabled ?? false,
			'data-controler-id': bond.tabs?.id,
			'data-active': state.isActive
		};
	}

	override get handlers() {
		const isDisabled = untrack(() => this.bond.state?.props).disabled ?? false;

		return {
			onclick: () => {
				if (isDisabled) return;
				this.bond.state.select();
			}
		};
	}

	override onmount(node: HTMLElement): void | (() => void) {
		const headerElement = this.bond.tabs?.headerElement;

		if (!headerElement) {
			node.hidden = true;
			return;
		}

		portal(headerElement)(node);
	}
}

class TabBodyAtom extends BondAtom<TabBondBase, HTMLElement> {
	constructor(bond: TabBondBase) {
		super(bond, 'body');
	}
	override get attrs() {
		const bond = this.bond;
		const tabHeaderId = getElementId(bond.id, 'tab-header');
		const descriptionId = getElementId(bond.id, 'tab-description');
		return {
			...super.attrs,
			role: 'tabpanel' as const,
			'aria-labeledby': tabHeaderId,
			'aria-describedby': descriptionId,
			'aria-controledby': tabHeaderId,
			'data-active': bond.state.isActive
		};
	}
}

class TabDescriptionAtom extends BondAtom<TabBondBase, HTMLElement> {
	constructor(bond: TabBondBase) {
		super(bond, 'description');
	}
	override get attrs() {
		return {
			...super.attrs
		};
	}
}

// Hand-written base for TabBond — parent-tabs capture and value/text/mount helpers the atoms call.
// Non-generic (T is a runtime phantom carried by state); generic surface re-exposed by the facade.
class TabBondBase extends Bond<TabBondProps<unknown>, TabBondState> {
	#parent: ITabs | undefined;

	constructor(state: TabBondState) {
		super(state, 'tab');
		this.#parent = TabsBond.get();
	}

	// The narrow parent contract this tab depends on (not the whole TabsBond).
	get tabs(): ITabs | undefined {
		return this.#parent;
	}

	get value() {
		return this.state.props.value;
	}

	get text() {
		return this.elements?.header?.innerText ?? '';
	}

	mount() {
		return this.#parent?.mountItem(this.value, this as unknown as TabBond);
	}
	unmount() {
		this.#parent?.unmountItem(this.id);
	}
}

// TabBond — `defineBond` (§6) over TabBondBase via the generic facade (see TabsBond);
// T is carried by state/tabs.
const TabBondImpl = defineBond<
	{
		header: typeof TabHeaderAtom;
		body: typeof TabBodyAtom;
		description: typeof TabDescriptionAtom;
	},
	TabBondState,
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

// Generic instance type — narrows `state`/`tabs` to carry `T` (brand-preserving).
export type TabBond<T = unknown> = BondOf<typeof TabBondImpl> & {
	readonly state: TabBondState<T>;
	readonly tabs: ITabs<T> | undefined;
};

// Generic-constructor facade over the non-generic impl.
interface TabBondConstructor {
	new <T = unknown>(state: TabBondState<T>): TabBond<T>;
	readonly CONTEXT_KEY: string;
	get<T = unknown>(): TabBond<T> | undefined;
	set<T = unknown>(bond: TabBond<T>): TabBond<T>;
}

export const TabBond = TabBondImpl as unknown as TabBondConstructor;

export class TabBondState<T = unknown> extends BondState<TabBondProps<T>> {
	// Narrow parent contract (not the whole TabsBond/TabsBondState).
	#parent?: ITabs<T> = TabsBond.get() as TabsBond<T> | undefined;

	constructor(props: TabBondProps<T>) {
		super(props);

		// Re-register the parent's selection capability on this child state so the tab-header
		// atom can project it via `.role('item', value)`. Same instance — shared surface.
		const selection = this.#parent?.selectionCapability();
		if (selection) this.capability(selection);
	}

	get isActive() {
		return this.#parent?.activeValue === this.props.value;
	}

	get isDisabled() {
		return (
			this.props.disabled ??
			this.#parent?.headerElement?.getAttribute?.('aria-disabled') === 'true'
		);
	}

	select() {
		this.#parent?.select(this.props.value);
	}

	unselect() {
		this.#parent?.unselect();
	}
}
