import { Bond, Atom, type BondStateProps } from '$svelte-atoms/core/shared/bond';
import { defineBond, type BondOf } from '$svelte-atoms/core/shared';
import { tick, untrack } from 'svelte';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type StackStateProps = BondStateProps & {
	value?: string;
};

export type StackElements = {
	root?: HTMLElement;
};

// Bond shape the stack atoms type `this.bond` against — breaks the atom↔bond cycle.

// -----------------------------------------------------------------------------
// Internal types
// -----------------------------------------------------------------------------

type StackBondView = StackBondBase;

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

export class StackRootAtom extends Atom<StackBondView> {
	constructor(bond: StackBondView) {
		super(bond, 'root');
	}

	override get attrs() {
		return {
			...super.attrs,
			'data-atom': this.bond.id ?? '',
			'data-kind': 'stack-root'
		};
	}
}

export class StackItemAtom extends Atom<StackBondView> {
	#value: string;

	constructor(bond: StackBondView, value: string) {
		super(bond, `item-${value}`);
		this.#value = value;
	}

	override get attrs() {
		return {
			...super.attrs,
			'data-atom': this.bond.id ?? '',
			'data-kind': 'stack-item',
			'data-stack-item': this.#value,
			style: `z-index: ${this.bond.getZIndex(this.#value)}`
		};
	}
}

// Hand-written base for StackBond — provides per-value dynamic item atoms.

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

class StackBondBase extends Bond<StackStateProps> {
	#order = $state<{ id: string; index: number }[]>([]);

	constructor(props: StackStateProps, name = 'stack') {
		super(props, name);

		$effect(() => {
			const value = this.props.value;
			if (value) {
				untrack(() => this.bringToFront(value));
			}
		});
	}

	item(value: string) {
		return new StackItemAtom(this, value);
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

	bringToFront(value: string) {
		const order = untrack(() => this.#order);
		const item = order.find((item) => item.id === value);

		if (!item) return;

		const newOrder = [...order]
			.sort((a, b) => {
				if (a.id === value) return 1;
				if (b.id === value) return -1;
				return a.index - b.index;
			})
			.map((item, i) => ({ ...item, index: i + 1 }));

		this.#order = newOrder;

		// Update value to the new top item
		const topValue = newOrder.at(-1)?.id;
		if (topValue) {
			this.props.value = topValue;
		}
	}

	sendToBack(value: string) {
		const order = untrack(() => this.#order);
		const item = order.find((item) => item.id === value);
		if (!item) return;

		const newOrder = [...order]
			.sort((a, b) => {
				if (a.id === value) return -1;
				if (b.id === value) return 1;
				return a.index - b.index;
			})
			.map((item, i) => ({ ...item, index: i + 1 }));

		this.#order = newOrder;

		// Update value to the new top item
		const topValue = newOrder.at(-1)?.id;
		if (topValue) {
			this.props.value = topValue;
		}
	}

	bringForward(value: string) {
		const order = untrack(() => this.#order);
		const item = order.find((i) => i.id === value);
		if (!item) return;

		const sortedOrder = [...order].sort((a, b) => a.index - b.index);
		const currentIndex = sortedOrder.findIndex((i) => i.id === value);
		const neighbor = sortedOrder[currentIndex + 1];

		if (!neighbor) return;

		const newOrder = [...order]
			.sort((a, b) => {
				if (a.id === value && b.id === neighbor.id) return 1;
				if (a.id === neighbor.id && b.id === value) return -1;
				return a.index - b.index;
			})
			.map((item, i) => ({ ...item, index: i + 1 }));

		this.#order = newOrder;

		// Update value to the new top item
		const topValue = newOrder.at(-1)?.id;
		if (topValue) {
			this.props.value = topValue;
		}
	}

	sendBackward(value: string) {
		const order = untrack(() => this.#order);
		const item = order.find((i) => i.id === value);
		if (!item) return;

		const sortedOrder = [...order].sort((a, b) => a.index - b.index);
		const currentIndex = sortedOrder.findIndex((i) => i.id === value);
		const neighbor = sortedOrder[currentIndex - 1];

		if (!neighbor) return;

		const newOrder = [...order]
			.sort((a, b) => {
				if (a.id === value && b.id === neighbor.id) return -1;
				if (a.id === neighbor.id && b.id === value) return 1;
				return a.index - b.index;
			})
			.map((item, i) => ({ ...item, index: i + 1 }));

		this.#order = newOrder;

		// Update value to the new top item
		const topValue = newOrder.at(-1)?.id;
		if (topValue) {
			this.props.value = topValue;
		}
	}

	getZIndex(value: string): number {
		const item = this.#order.find((item) => item.id === value);
		return item ? item.index : 0;
	}

	get items() {
		return this.#order;
	}
}

// StackBond — `defineBond` over `StackBondBase`; z-order lives on `StackBondBase`.

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

const StackBondImpl = defineBond<
	{ root: typeof StackRootAtom },
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	typeof StackBondBase
>({
	name: 'stack',
	base: StackBondBase,
	atoms: { root: StackRootAtom }
});

// Instance type of the stack bond — paired with the `const` above.
export type StackBond = BondOf<typeof StackBondImpl>;

interface StackBondConstructor {
	new (props: StackStateProps): StackBond;
	readonly CONTEXT_KEY: string;
	readonly spec: (typeof StackBondImpl)['spec'];
	get(): StackBond | undefined;
	getOrThrow(message?: string): StackBond;
	set(bond: StackBond): StackBond;
	create(props: StackStateProps): StackBond;
}

export const StackBond = StackBondImpl as unknown as StackBondConstructor;
