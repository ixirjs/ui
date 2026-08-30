/**
 * Tabs' shared object — a plain state class on the redesigned `Kernel`.
 *
 * Same surface the family always had (`{ tabs }`, `getBond`, `factory`, `select`/`unselect`,
 * `items`, `roving`, `tabContents`), none of the runtime. Tabs register at their root's init in
 * document order; the roving highlight over the enabled ones IS the selection (APG automatic
 * activation), so it is controlled by `props.value`; tab bodies register their content for
 * `Tabs.Content`.
 */
import { SvelteMap } from 'svelte/reactivity';
import type { Snippet } from 'svelte';
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import type { PresetLike } from '$ixirjs/ui/preset';
import { createRovingFocus, type RovingFocus } from '$ixirjs/ui/capability/models/roving.svelte';
import type { TabBond } from './tab/bond.svelte';

export type TabsBondProps = {
	id?: string | undefined;
	value?: string | undefined;
	presets?:
		| { root?: PresetLike; header?: PresetLike; body?: PresetLike; content?: PresetLike }
		| undefined;
};

export type TabContent = {
	value: string;
	render: Snippet<[Record<string, unknown>]>;
	props: Record<string, unknown>;
};

// Narrow parent contract a TabBond child depends on, not the whole TabsBond.
export interface ITabs<T = unknown> {
	readonly id: string;
	readonly activeValue: string | undefined;
	readonly headerElement: HTMLElement | undefined;
	mountItem(value: string, tab: TabBond<T>): () => void;
	unmountItem(id: string): void;
	select(value: string): void;
	unselect(): void;
}

export const TabsContext = Kernel.context<TabsBond>('bond/tabs');

export class TabsBond<T = unknown> implements ITabs<T> {
	readonly name = 'tabs';
	readonly props: TabsBondProps;
	/** Mounted tabs in document order. */
	readonly items = new Map<string, TabBond<T>>();
	readonly #contents = new SvelteMap<string, TabContent>();
	readonly #roving: RovingFocus<TabBond<T>>;

	constructor(props: TabsBondProps) {
		this.props = props;
		// Controlled by `props.value`: an internal cell would drift the moment a tab is clicked and
		// the next arrow key would resume from the wrong tab.
		this.#roving = createRovingFocus<TabBond<T>>({
			ids: () => this.#enabledValues(),
			item: (id) => this.items.get(id),
			active: {
				get: () => this.props.value ?? null,
				set: (id) => (id === null ? this.unselect() : this.select(id))
			}
		});
	}

	static create(props: TabsBondProps): TabsBond {
		return new TabsBond(props);
	}
	static get = (): TabsBond | undefined => TabsContext.get();

	get id(): string {
		return this.props.id ?? 'tabs';
	}
	get rootId(): string {
		return Kernel.id(this.id, 'tabs-root');
	}
	get headerId(): string {
		return Kernel.id(this.id, 'tabs-header');
	}
	get bodyId(): string {
		return Kernel.id(this.id, 'tabs-body');
	}

	#enabledValues(): string[] {
		const ids: string[] = [];
		for (const [id, tab] of this.items) if (!tab.props.disabled) ids.push(id);
		return ids;
	}

	// The roving highlight, exposed for the tab header's roving tabindex.
	get roving(): RovingFocus<TabBond<T>> {
		return this.#roving;
	}

	/** Arrow/Home/End on the tablist. Moving the highlight selects; DOM focus then follows. */
	onkeydown(event: KeyboardEvent): void {
		if (event.defaultPrevented) return;
		let moved: string | null;
		if (event.key === 'ArrowRight') moved = this.#roving.next();
		else if (event.key === 'ArrowLeft') moved = this.#roving.previous();
		else if (event.key === 'Home') moved = this.#roving.first();
		else if (event.key === 'End') moved = this.#roving.last();
		else return;
		event.preventDefault();
		this.focusTab(moved);
	}

	focusTab(id: string | null) {
		if (id === null || typeof document === 'undefined') return;
		const header = this.items.get(id)?.headerId;
		if (header) document.getElementById(header)?.focus();
	}

	get activeValue() {
		return this.props.value;
	}

	get headerElement(): HTMLElement | undefined {
		return typeof document === 'undefined'
			? undefined
			: (document.getElementById(this.headerId) ?? undefined);
	}

	get selectedItem(): TabBond<T> | undefined {
		return this.props.value ? this.items.get(this.props.value) : undefined;
	}

	get tabContents(): Iterable<TabContent> {
		return this.#contents.values();
	}

	get activeTabContent() {
		return this.props.value ? this.#contents.get(this.props.value) : undefined;
	}

	mountItem<I extends T>(id: string, item: TabBond<I>) {
		if (this.items.size && !this.props.value) {
			this.props.value = item.props.value;
		}
		this.items.set(id, item as unknown as TabBond<T>);
		return () => this.unmountItem(id);
	}

	unmountItem(id: string) {
		this.items.delete(id);
	}

	select(id: string) {
		this.props.value = id;
	}

	unselect() {
		this.props.value = undefined;
	}

	registerTabContent(
		id: string,
		content: { render: Snippet<[Record<string, unknown>]>; props: Record<string, unknown> }
	) {
		this.#contents.set(id, { value: id, ...content });
	}

	unregisterTabContent(id: string) {
		this.#contents.delete(id);
	}

	getTab(id: string): TabBond<T> | undefined {
		return this.items.get(id);
	}
}
