/**
 * A tab's shared object. Registered with the tabs at the root's init (document order); its ids
 * derive from the root's seed, and the rendered panel hands the header its id for `aria-controls`.
 */
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import type { PresetLike } from '$ixirjs/ui/preset';
import { TabsContext, type ITabs } from '$ixirjs/ui/components/tabs/bond.svelte';

export type TabBondProps<T = unknown> = {
	id?: string | undefined;
	value: string;
	disabled?: boolean;
	data: T;
	presets?: { header?: PresetLike; body?: PresetLike; description?: PresetLike } | undefined;
};

export const TabContext = Kernel.context<TabBond>('bond/tab');

export class TabBond<T = unknown> {
	readonly name = 'tab';
	readonly props: TabBondProps<T>;
	readonly #parent: ITabs<T> | undefined;
	/** The rendered panel's element id, while `Tabs.Content` renders it. */
	panelId = $state<string | undefined>();

	constructor(props: TabBondProps<T>, parent?: ITabs<T>) {
		this.props = props;
		this.#parent = parent ?? (TabsContext.get() as ITabs<T> | undefined);
	}

	static create<T>(props: TabBondProps<T>): TabBond<T> {
		return new TabBond(props);
	}
	static get = (): TabBond | undefined => TabContext.get();

	get id(): string {
		return this.props.id ?? 'tab';
	}
	get headerId(): string {
		return Kernel.id(this.id, 'tab-header');
	}
	get bodyId(): string {
		return Kernel.id(this.id, 'tab-body');
	}

	get tabs(): ITabs<T> | undefined {
		return this.#parent;
	}

	get value() {
		return this.props.value;
	}

	get text() {
		return typeof document === 'undefined'
			? ''
			: (document.getElementById(this.headerId)?.innerText ?? '');
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
		return this.#parent?.mountItem(this.value, this);
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
