/**
 * RadioGroup's shared object — a plain state class on the redesigned `Kernel`.
 *
 * Same surface the family always had (`RadioGroupBond`, `getBond`, `select`), none of the runtime.
 * Radios register a handle at their init and are released on teardown; selection is the native
 * radio's, so there is no roving tab stop to keep — the group only routes the checked-state
 * callbacks in the order the family always fired them: write, previous item, next item, group.
 */
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import type { StateChangeCallback } from '$ixirjs/ui/types';

export type RadioCheckedChangeListener = (checked: boolean, event: Event) => void;

export type RadioGroupBondProps<T = string> = {
	id?: string | undefined;
	value: T | undefined;
	disabled: boolean;
	required: boolean;
	readonly: boolean;
	name?: string | undefined;
	onvaluechange?: StateChangeCallback<T> | undefined;
};

/** What a radio registers with its group: its live `value` and how to tell it its checked state moved. */
export interface RadioItemHandle<T = string> {
	readonly value: T | undefined;
	readonly notify: RadioCheckedChangeListener;
}

export const RadioGroupContext = Kernel.context<RadioGroupBond<unknown>>('radio-group');

export class RadioGroupBond<T = string> {
	readonly name = 'radio-group';
	readonly props: RadioGroupBondProps<T>;
	/** Mounted radios in document order. A `Set`: the handle reads `value` live, so nothing keys on it. */
	readonly items = new Set<RadioItemHandle<T>>();

	constructor(props: RadioGroupBondProps<T>) {
		this.props = props;
	}

	static create<T = string>(props: RadioGroupBondProps<T>): RadioGroupBond<T> {
		return new RadioGroupBond<T>(props);
	}

	get id(): string {
		return this.props.id ?? 'radio-group';
	}

	attachItem(item: RadioItemHandle<T>): () => void {
		this.items.add(item);
		return () => {
			this.items.delete(item);
		};
	}

	select(nextValue: T, event: Event, source?: RadioCheckedChangeListener): boolean {
		if (Object.is(this.props.value, nextValue)) return false;
		const previousValue = this.props.value;
		this.props.value = nextValue;
		if (previousValue !== undefined) this.#notify(previousValue, false, event);
		if (!this.#notify(nextValue, true, event, source)) source?.(true, event);
		this.props.onvaluechange?.(nextValue, { event });
		return true;
	}

	#notify(
		itemValue: T,
		checked: boolean,
		event: Event,
		source?: RadioCheckedChangeListener
	): boolean {
		let sourceNotified = false;
		for (const item of this.items) {
			if (item.value === undefined || !Object.is(item.value, itemValue)) continue;
			item.notify(checked, event);
			if (item.notify === source) sourceNotified = true;
		}
		return sourceNotified;
	}
}
