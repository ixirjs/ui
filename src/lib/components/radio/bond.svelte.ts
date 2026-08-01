import type { StateChangeCallback } from '$ixirjs/ui/types';
import { Bond, bondContextKey, type BondStateProps } from '$ixirjs/ui/shared/bond';

export type RadioCheckedChangeListener = (checked: boolean, event: Event) => void;

export type RadioGroupBondProps<T = string> = BondStateProps & {
	value: T | undefined;
	disabled: boolean;
	required: boolean;
	readonly: boolean;
	name?: string;
	onvaluechange?: StateChangeCallback<T>;
};

/** Owns group selection, item registration, and callback ordering for one RadioGroup subtree. */
export class RadioGroupBond<T = string> extends Bond<RadioGroupBondProps<T>> {
	static CONTEXT_KEY = bondContextKey('radio-group');
	readonly #listeners = new Map<T, Set<RadioCheckedChangeListener>>();

	constructor(props: RadioGroupBondProps<T>) {
		super(props, 'radio-group');
	}

	registerItem(itemValue: T, listener: RadioCheckedChangeListener): () => void {
		const listeners = this.#listeners.get(itemValue) ?? new Set();
		listeners.add(listener);
		this.#listeners.set(itemValue, listeners);
		return () => {
			listeners.delete(listener);
			if (listeners.size === 0) this.#listeners.delete(itemValue);
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
		for (const listener of this.#listeners.get(itemValue) ?? []) {
			listener(checked, event);
			if (listener === source) sourceNotified = true;
		}
		return sourceNotified;
	}
}
