import type { Snippet } from 'svelte';
import {
	Bond,
	BondState,
	BondAtom,
	type BondStateProps,
	type Capability
} from '$svelte-atoms/core/shared/bond.svelte';
import { defineBond, type BondOf, type ViewOf } from '$svelte-atoms/core/shared';
import {
	createSelection,
	selectionCapability,
	SELECTION,
	type SelectionModel
} from '$svelte-atoms/core/shared/capabilities/selection.svelte';
import type { Collection } from '$svelte-atoms/core/shared/collection.svelte';
import type { TabBond } from './tab/bond.svelte';

export type TabsBondProps<T extends Record<string, unknown> = Record<string, unknown>> =
	BondStateProps & {
		value?: string | undefined;
		multiple?: boolean;
		extend?: T;
	};

export type TabElements = {
	root: HTMLElement;
	header: HTMLElement;
	body: HTMLElement;
};

export type TabContentSnippet = {
	props: Record<string, unknown>;
	children: Snippet<[{ tab?: TabBond }]>;
};

// Narrow parent contract a TabBond child depends on — not the whole TabsBond.
// Tab needs both state-level (mount/select/active value) and bond-level (header element,
// selection capability) members, so TabsBond implements it (thin delegators).
export interface ITabs<T = unknown> {
	readonly id: string;
	// The active tab value (`props.value`).
	readonly activeValue: string | undefined;
	// The parent's header element — tab headers portal into it.
	readonly headerElement: HTMLElement | undefined;
	// The selection capability a tab header re-registers to project `aria-selected`.
	selectionCapability(): Capability | undefined;
	mountItem(value: string, tab: TabBond<T>): () => void;
	unmountItem(id: string): void;
	select(value: string): void;
	unselect(): void;
}

// Bond shape the tabs atoms type `this.bond` against — breaks the atom↔bond cycle.
type TabsBondView = ViewOf<TabsBondState>;

export class TabsRootAtom extends BondAtom<TabsBondView> {
	constructor(bond: TabsBondView) {
		super(bond, 'root');
	}

	override get attrs() {
		return {
			...super.attrs,
			'aria-orientation': 'horizontal' as const
		};
	}
}

export class TabsHeaderAtom extends BondAtom<TabsBondView> {
	constructor(bond: TabsBondView) {
		super(bond, 'header');
	}

	override get attrs() {
		return {
			...super.attrs,
			role: 'tablist'
		};
	}
}

export class TabsBodyAtom extends BondAtom<TabsBondView> {
	constructor(bond: TabsBondView) {
		super(bond, 'body');
	}

	override get attrs() {
		return {
			...super.attrs,
			role: 'group'
		};
	}
}

// Hand-written base for TabsBond — the ITabs delegators tab children depend on.
// Non-generic (T is a runtime phantom carried by state); generic surface re-exposed by the facade.
class TabsBondBase extends Bond<TabsBondProps, TabsBondState> implements ITabs {
	// ── ITabs: the narrow contract tab children depend on (delegators) ──
	get activeValue() {
		return this.state.props.value;
	}
	get headerElement() {
		return this.element<HTMLElement>('header');
	}
	selectionCapability(): Capability | undefined {
		return this.capability(SELECTION);
	}
	mountItem(value: string, tab: TabBond) {
		return this.state.mountItem(value, tab);
	}
	unmountItem(id: string) {
		this.state.unmountItem(id);
	}
	select(value: string) {
		this.state.select(value);
	}
	unselect() {
		this.state.unselect();
	}
}

// TabsBond — `defineBond` (§6) over TabsBondBase via the generic facade:
// non-generic impl re-exposed with T through a generic-constructor interface + `type TabsBond<T>`.
const TabsBondImpl = defineBond<
	{ root: typeof TabsRootAtom; header: typeof TabsHeaderAtom; body: typeof TabsBodyAtom },
	TabsBondState,
	typeof TabsBondBase
>({
	name: 'tabs',
	base: TabsBondBase,
	atoms: { root: TabsRootAtom, header: TabsHeaderAtom, body: TabsBodyAtom }
});

// Generic instance type — narrows `state` and re-types the `ITabs<T>` surface (brand-preserving).
export type TabsBond<T = unknown> = BondOf<typeof TabsBondImpl> & {
	readonly state: TabsBondState<T>;
} & ITabs<T>;

// Generic-constructor facade over the non-generic impl.
interface TabsBondConstructor {
	new <T = unknown>(state: TabsBondState<T>): TabsBond<T>;
	readonly CONTEXT_KEY: string;
	get<T = unknown>(): TabsBond<T> | undefined;
	getOrThrow<T = unknown>(message?: string): TabsBond<T>;
	set<T = unknown>(bond: TabsBond<T>): TabsBond<T>;
}

export const TabsBond = TabsBondImpl as unknown as TabsBondConstructor;

export class TabsBondState<T = unknown> extends BondState<TabsBondProps> {
	#selectedItem = $derived(
		this.props?.value ? this.items.get(this.props?.value) : undefined
	) as TabBond<T>;

	// Selection capability (single mode). Tabs store a scalar `props.value`; the backing
	// adapts it to the array surface (value ↔ [value]). `interactive: false` means
	// state-reflection only — the tab-header owns its disabled-guarded onclick.
	#selectionCap = this.capability(
		selectionCapability(
			createSelection<string>({
				get: () => (this.props.value ? [this.props.value] : []),
				set: (vs) => (this.props.value = vs[0]),
				mode: () => 'single'
			}),
			{ commit: 'select', interactive: false }
		)
	);

	constructor(props: TabsBondProps) {
		super(props);
	}

	// The selection capability surface — the active tab value.
	get selection(): SelectionModel<string> {
		return this.#selectionCap.surface;
	}

	// Insertion-ordered reactive collection of mounted tab bonds.
	get items(): Collection<TabBond<T>> {
		return this.collection<TabBond<T>>('item');
	}

	// Deferred tab-content snippets — kind-cached Collection keyed by value.
	get #contents() {
		return this.collection<{
			value: string;
			render: Snippet<[Record<string, unknown>]>;
			props: Record<string, unknown>;
		}>('content');
	}

	get selectedItem() {
		return this.#selectedItem;
	}

	get tabContents() {
		return this.#contents.values;
	}

	get activeTabContent() {
		return this.props?.value ? this.#contents.get(this.props.value) : undefined;
	}

	mountItem<I extends T>(id: string, item: TabBond<I>) {
		if (this.items.size && !this.props.value) {
			this.props.value = item.state.props.value;
		}

		// Collection.attach registers + returns the cleanup (replaces the old
		// set + `() => unmountItem`). See shared/collection.svelte.ts.
		return this.items.attach(id, item as unknown as TabBond<T>);
	}

	unmountItem(id: string) {
		this.items.delete(id);
	}

	select(id: string) {
		this.selection.select(id);
	}

	unselect() {
		this.selection.clear();
	}

	registerTabContent(
		id: string,
		content: { render: Snippet<[Record<string, unknown>]>; props: Record<string, unknown> }
	) {
		this.#contents.attach(id, {
			value: id,
			...content
		});
	}

	unregisterTabContent(id: string) {
		this.#contents.delete(id);
	}

	getTab(id: string) {
		return this.items.get(id);
	}
}
