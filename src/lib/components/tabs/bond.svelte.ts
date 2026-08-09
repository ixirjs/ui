import { tick, type Snippet } from 'svelte';
import { Bond, defineAtom, type BondStateProps } from '$ixirjs/ui/shared/bond';
import type { Capability } from '$ixirjs/ui/shared/capability';
import { defineBond, type BondOf } from '$ixirjs/ui/shared';
import {
	createSelection,
	selectionCapability,
	SELECTION,
	type SelectionModel
} from '$ixirjs/ui/shared/capability/models/selection.svelte';
import {
	createRovingFocus,
	rovingCapability,
	type RovingFocus
} from '$ixirjs/ui/shared/capability/models/roving.svelte';
import { navigationCapability } from '$ixirjs/ui/shared/capability/models/navigation.svelte';
import type { Collection } from '$ixirjs/ui/shared/bond/collection.svelte';
import type { TabBond } from './tab/bond.svelte';

export type TabsBondProps<T extends Record<string, unknown> = Record<string, unknown>> =
	BondStateProps & {
		value?: string | undefined;
		multiple?: boolean;
		extend?: T;
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

export const TabsRootAtom = defineAtom<TabsBondBase>('root', {
	slot: '@ixirjs/tabs:root',
	docs: 'Tabs root orientation projection.',
	attrs: () => ({
		'aria-orientation': 'horizontal' as const
	})
});

export const TabsHeaderAtom = defineAtom<TabsBondBase>('header', { role: 'tablist' });

export const TabsBodyAtom = defineAtom<TabsBondBase>('body', { role: 'group' });

// Hand-written base for TabsBond. Parent selection, mounted tab/content collections,
// and child coordination live on the Bond instance.

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

	// Roving highlight over the enabled tab values. Controlled by `props.value`: for tabs the
	// highlight *is* the selection (APG automatic activation), so an internal cell would drift the
	// moment a tab is clicked and the next arrow key would resume from the wrong tab.
	#roving: RovingFocus<TabBond> = createRovingFocus<TabBond>({
		ids: () => this.#enabledValues,
		item: (id) => this.items.get(id),
		active: {
			get: () => this.props.value ?? null,
			set: (id) => (id === null ? this.unselect() : this.select(id))
		}
	});

	constructor(props: TabsBondProps, name = 'tabs') {
		super(props, name);
		// Eagerly create owned collections outside derived reads; collection() registers a capability.
		void this.items;
		void this.#contents;
		// Registered to satisfy navigation's `requires: [ROVING]`. No atom claims role 'container',
		// so no aria-activedescendant is emitted: tab headers carry real DOM focus.
		this.capability(rovingCapability(this.#roving));
		// Arrow/Home/End on the tablist. Moving the highlight selects (controlled cell above);
		// onMove then follows with DOM focus, which the roving model itself never touches.
		this.capability(
			navigationCapability(this.#roving, {
				roles: ['tablist'],
				orientation: 'horizontal',
				preventScroll: true,
				onMove: (id) => this.focusTab(id)
			})
		);
	}

	get #enabledValues(): readonly string[] {
		return this.items.entries.filter(([, tab]) => !tab.props.disabled).map(([id]) => id);
	}

	// The roving highlight, exposed for the tab header's roving tabindex.
	get roving(): RovingFocus<TabBond> {
		return this.#roving;
	}

	focusTab(id: string | null) {
		if (id === null) return;
		const header = () => this.items.get(id)?.elements?.header;
		const element = header();
		if (!(element instanceof HTMLElement)) return;
		element.focus();
		// ponytail: re-assert focus after the flush. Selecting a tab re-runs the tab header's
		// portal attachment, whose cleanup `remove()`s the node and blurs it. The root fix is that
		// re-parent churn (TabHeaderAtom's onmount re-running on a state change at all); until
		// then, only restore focus we actually lost — never steal it back from elsewhere.
		tick().then(() => {
			const active = document.activeElement;
			if (active && active !== document.body) return;
			const next = header();
			if (next instanceof HTMLElement) next.focus();
		});
	}

	get activeValue() {
		return this.props.value;
	}

	get headerElement() {
		return this.nodeByPart('header')?.element as HTMLElement | undefined;
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

export const TabsBond = defineBond({
	name: 'tabs',
	base: TabsBondBase,
	atoms: {
		root: { atom: TabsRootAtom },
		// role 'tablist' receives the navigation keydown; tab headers are portaled into it, so their
		// arrow keys bubble here. Deliberately not 'container': that would also pull in roving's
		// aria-activedescendant projection, which is for widgets whose items never take DOM focus.
		header: { atom: TabsHeaderAtom, role: 'tablist' },
		body: TabsBodyAtom
	}
});

export type TabsBond<T = unknown> = BondOf<typeof TabsBond> & {
	readonly items: Collection<TabBond<T>>;
	readonly selectedItem: TabBond<T> | undefined;
	mountItem<I extends T>(id: string, item: TabBond<I>): () => void;
	getTab(id: string): TabBond<T> | undefined;
} & ITabs<T>;
