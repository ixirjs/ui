import { getContext, setContext } from 'svelte';
import { createAttachmentKey } from 'svelte/attachments';
import { nanoid } from 'nanoid';
import { SelectBond } from '../bond.svelte';
import type { DropdownMenuItemControllerInterface } from '$svelte-atoms/core/components/dropdown-menu/item/controller.svelte';

export type SelectItemProps<T = unknown> = {
	readonly id: string;
	readonly value: string;
	readonly label?: string;
	readonly data?: T;
};

export class SelectItemController<T = unknown> implements DropdownMenuItemControllerInterface<
	SelectItemProps<T>
> {
	static CONTEXT_KEY = '@atoms/context/select/item';

	#id: string;
	#props: SelectItemProps<T>;
	#element: HTMLElement | null = null;
	#select: SelectBond | undefined;

	#unmount?: (() => void) | undefined;

	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	#createdAt = new Date();

	constructor(props: SelectItemProps<T>) {
		this.#props = props;
		this.#id = this.props.id ?? nanoid();

		this.#select = SelectBond.get() as
			| SelectBond
			| undefined;

		if (!this.#select) {
			throw new Error('SelectItem must be used within a Select context');
		}
	}

	get id() {
		return this.#id;
	}

	get createdAt() {
		return this.#createdAt;
	}

	get props() {
		return this.#props;
	}

	get element() {
		return this.#element;
	}

	get value() {
		return this.props?.value;
	}

	get data() {
		return this.props?.data;
	}

	// Named `selectBond` to avoid colliding with the `select()` method.
	get selectBond() {
		return this.#select;
	}

	get label() {
		const element = (this.#element?.querySelector('[data-label]') ?? this.#element) as
			| HTMLElement
			| undefined
			| null;
		return element?.innerText ?? this.props?.label ?? '';
	}

	get isHighlighted() {
		// The controller mounts into the roving by its own `#id`, so the active id IS that id.
		return this.#select?.state.roving.activeId === this.id;
	}

	get isSelected() {
		return this.#select?.state.props.values?.includes(this.value) ?? false;
	}

	mount() {
		this.#unmount = this.#select?.state?.mountItem?.(this.#id, this) ?? undefined;

		return this.unmount;
	}

	unmount() {
		this.#unmount?.();
	}

	destroy() {
		this.unmount();
	}

	select() {
		this.#select?.state.select([this.value]);
	}

	unselect() {
		this.#select?.state.unselect([this.value]);
	}

	toggle() {
		if (this.isSelected) {
			this.unselect();
		} else {
			this.select();
		}
	}

	close() {
		this.#select?.state.close();
	}

	share() {
		return SelectItemController.set(this);
	}

	elementProps() {
		const itemId = `select-item-${this.id}`;
		return {
			id: itemId,
			role: 'option',
			'aria-selected': this.isSelected,
			'data-selected': this.isSelected,
			'data-highlighted': this.isHighlighted,
			[createAttachmentKey()]: (node: HTMLElement) => {
				this.#element = node;
				return () => {
					this.#element = null;
				};
			}
		} as const;
	}

	static get<T = unknown>(): SelectItemController<T> | undefined {
		return getContext(SelectItemController.CONTEXT_KEY);
	}

	static set<T = unknown>(item: SelectItemController<T>): SelectItemController<T> {
		return setContext(SelectItemController.CONTEXT_KEY, item);
	}
}
