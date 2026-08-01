import type { Snippet } from 'svelte';
import {
	Bond,
	defineAtom,
	type BondStateProps,
	type Capability
} from '$svelte-atoms/core/shared/bond';
import { defineBond, type BondOf } from '$svelte-atoms/core/shared';
import {
	ariaRole,
	defineAtomCapability,
	sharedCapabilityKey,
	type AtomHost
} from '$svelte-atoms/core/shared/capability';
import {
	createSelection,
	selectionCapability,
	SELECTION,
	type SelectionModel
} from '$svelte-atoms/core/shared/capability/models/selection.svelte';
import type { Collection } from '$svelte-atoms/core/shared/bond/collection.svelte';
import type { TabBond } from './tab/bond.svelte';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

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

// Narrow parent contract a TabBond child depends on, not the whole TabsBond.
export interface ITabs<T = unknown> {
	readonly id: string;
	readonly activeValue: string | undefined;
	readonly headerElement: HTMLElement | undefined;
	selectionCapability(): Capability | undefined;
	mountItem(value: string, tab: TabBond<T>): () => void;
	unmountItem(id: string): void;
	select(value: string): void;
	unselect(): void;
}

// -----------------------------------------------------------------------------
// Internal types
// -----------------------------------------------------------------------------

type TabsBondView = TabsBondBase;

// -----------------------------------------------------------------------------
// Capability slots and shared helpers
// -----------------------------------------------------------------------------

const TABS_ROOT = sharedCapabilityKey<void>('@svelte-atoms/tabs:root');

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

export const TabsRootAtom = defineAtom<TabsBondView>('root', (atom) => {
	atom.capability(tabsRootPresentation());
});
export type TabsRootAtom = InstanceType<typeof TabsRootAtom>;

export const TabsHeaderAtom = defineAtom<TabsBondView>('header', (atom) => {
	atom.capability(ariaRole('tablist'));
});
export type TabsHeaderAtom = InstanceType<typeof TabsHeaderAtom>;

export const TabsBodyAtom = defineAtom<TabsBondView>('body', (atom) => {
	atom.capability(ariaRole('group'));
});
export type TabsBodyAtom = InstanceType<typeof TabsBodyAtom>;

// -----------------------------------------------------------------------------
// Atom capabilities
// -----------------------------------------------------------------------------

function tabsRootPresentation() {
	return defineAtomCapability<void, AtomHost, TabsBondView>({
		slot: TABS_ROOT,
		meta: {
			layer: 1,
			kind: 'projection',
			projects: ['root'],
			docs: 'Tabs root orientation projection.'
		},
		behavior: {
			attrs: () => ({
				'aria-orientation': 'horizontal' as const
			})
		}
	});
}

// Hand-written base for TabsBond. Parent selection, mounted tab/content collections,
// and child coordination live on the Bond instance.

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

class TabsBondBase extends Bond<TabsBondProps> implements ITabs {
	#selectedItem = $derived(this.props?.value ? this.items.get(this.props?.value) : undefined) as
		| TabBond
		| undefined;

	// Selection capability (single mode). Tabs store a scalar `props.value`; the backing
	// adapts it to the array surface (value <-> [value]). `interactive: false` means
	// state-reflection only because the tab-header owns its disabled-guarded onclick.
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

	constructor(props: TabsBondProps, name = 'tabs') {
		super(props, name);
		// Eagerly create owned collections outside derived reads; collection() registers a capability.
		void this.items;
		void this.#contents;
	}

	get activeValue() {
		return this.props.value;
	}

	get headerElement() {
		return this.node('header')?.element as HTMLElement | undefined;
	}

	selectionCapability(): Capability | undefined {
		return this.capability(SELECTION);
	}

	get selection(): SelectionModel<string> {
		return this.#selectionCap.surface!;
	}

	get items(): Collection<TabBond> {
		return this.collection<TabBond>('item');
	}

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

	mountItem<I>(id: string, item: TabBond<I>) {
		if (this.items.size && !this.props.value) {
			this.props.value = item.props.value;
		}

		return this.items.set(id, item as unknown as TabBond);
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
		this.#contents.set(id, {
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

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

const TabsBondImpl = defineBond<
	{ root: typeof TabsRootAtom; header: typeof TabsHeaderAtom; body: typeof TabsBodyAtom },
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	typeof TabsBondBase
>({
	name: 'tabs',
	base: TabsBondBase,
	atoms: { root: TabsRootAtom, header: TabsHeaderAtom, body: TabsBodyAtom }
});

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type TabsBond<T = unknown> = BondOf<typeof TabsBondImpl> & {
	readonly items: Collection<TabBond<T>>;
	readonly selectedItem: TabBond<T> | undefined;
	mountItem<I extends T>(id: string, item: TabBond<I>): () => void;
	getTab(id: string): TabBond<T> | undefined;
} & ITabs<T>;

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

interface TabsBondConstructor {
	new <T = unknown>(props: TabsBondProps): TabsBond<T>;
	readonly CONTEXT_KEY: string;
	get<T = unknown>(): TabsBond<T> | undefined;
	getOrThrow<T = unknown>(message?: string): TabsBond<T>;
	set<T = unknown>(bond: TabsBond<T>): TabsBond<T>;
	create<T = unknown>(props: TabsBondProps): TabsBond<T>;
}

export const TabsBond = TabsBondImpl as unknown as TabsBondConstructor;
