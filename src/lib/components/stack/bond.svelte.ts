/**
 * Stack's shared object — a plain state class on the redesigned `Kernel`. Same surface
 * (`getBond`, `factory`, the z-order methods, `items`, `getZIndex`), none of the runtime.
 */
import { tick, untrack } from 'svelte';
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';

export type StackStateProps = {
	id?: string;
	value?: string | undefined;
};

export const StackContext = Kernel.context<StackBond>('bond/stack');

export class StackBond {
	readonly name = 'stack';
	readonly props: StackStateProps;
	#order = $state<{ id: string; index: number }[]>([]);

	constructor(props: StackStateProps) {
		this.props = props;
		$effect(() => {
			const value = this.props.value;
			if (value) untrack(() => this.bringToFront(value));
		});
	}

	static create(props: StackStateProps): StackBond {
		return new StackBond(props);
	}

	get id(): string {
		return this.props.id ?? 'stack';
	}
	get rootId(): string {
		return Kernel.id(this.id, 'stack-root');
	}
	itemId(value: string): string {
		return Kernel.id(this.id, `stack-item-${value}`);
	}

	registerItem(value: string) {
		const order = untrack(() => this.#order);
		if (!order.find((item) => item.id === value)) {
			// Start z-index at 1 so items are always above the stacking context baseline
			this.#order = [...order, { id: value, index: order.length + 1 }];
		}
	}

	unregisterItem(value: string) {
		const order = untrack(() => this.#order);
		tick().then(() => {
			this.#order = order.filter((i) => i.id !== value);
		});
	}

	raise(value: string) {
		this.bringToFront(value);
	}

	#reorder(order: { id: string; index: number }[], compare: (a: string, b: string) => number) {
		this.#order = [...order]
			.sort((a, b) => compare(a.id, b.id) || a.index - b.index)
			.map((item, i) => ({ ...item, index: i + 1 }));
		// Update value to the new top item
		const topValue = this.#order.at(-1)?.id;
		if (topValue) this.props.value = topValue;
	}

	bringToFront(value: string) {
		const order = untrack(() => this.#order);
		if (!order.find((item) => item.id === value)) return;
		this.#reorder(order, (a, b) => (a === value ? 1 : b === value ? -1 : 0));
	}

	sendToBack(value: string) {
		const order = untrack(() => this.#order);
		if (!order.find((item) => item.id === value)) return;
		this.#reorder(order, (a, b) => (a === value ? -1 : b === value ? 1 : 0));
	}

	#neighbor(value: string, offset: number) {
		const order = untrack(() => this.#order);
		if (!order.find((i) => i.id === value)) return undefined;
		const sorted = [...order].sort((a, b) => a.index - b.index);
		const neighbor = sorted[sorted.findIndex((i) => i.id === value) + offset];
		return neighbor ? { order, neighbor } : undefined;
	}

	bringForward(value: string) {
		const found = this.#neighbor(value, 1);
		if (!found) return;
		const { order, neighbor } = found;
		this.#reorder(order, (a, b) =>
			a === value && b === neighbor.id ? 1 : a === neighbor.id && b === value ? -1 : 0
		);
	}

	sendBackward(value: string) {
		const found = this.#neighbor(value, -1);
		if (!found) return;
		const { order, neighbor } = found;
		this.#reorder(order, (a, b) =>
			a === value && b === neighbor.id ? -1 : a === neighbor.id && b === value ? 1 : 0
		);
	}

	getZIndex(value: string): number {
		const item = this.#order.find((item) => item.id === value);
		return item ? item.index : 0;
	}

	get items() {
		return this.#order;
	}
}
