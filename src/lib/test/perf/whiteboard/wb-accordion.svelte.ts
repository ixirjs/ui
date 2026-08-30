/**
 * WHITEBOARD accordion — the behavioural case, from a blank page.
 *
 * Promises kept from `Accordion`/`AccordionItem`: `values`/`multiple`/`collapsible`/`disabled`,
 * per-item `value`/`disabled`, header = trigger with `aria-expanded`/`aria-controls`/roving
 * `tabindex`/`aria-disabled`, body = `role="region"` + `aria-labelledby` rendered only while open,
 * ArrowUp/Down/Home/End over enabled headers, focus follows Tab/click, swappable preset classes,
 * SSR-deterministic ids. No Bond, Atom, capability runtime, node registry or Kernel — one state
 * class per part, one context each, plain elements.
 */
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';

export const AccordionContext = Kernel.context<WbAccordion>('wb-accordion');
export const AccordionItemContext = Kernel.context<WbAccordionItem>('wb-accordion-item');

export class WbAccordion {
	readonly id: string;
	#values: () => string[];
	#set: (v: string[]) => void;
	#multiple: () => boolean;
	#collapsible: () => boolean;
	#disabled: () => boolean;
	/** Registration order = mount order = document order. Plain array: keyboard reads it untracked. */
	readonly items: WbAccordionItem[] = [];
	/** The header holding the roving tabindex; null falls back to the first enabled item. */
	focused = $state<string | null>(null);
	/**
	 * The fallback tab stop. One `$state` written only when it changes: a plain array read would
	 * never re-run a header, and a reactive array would mark every header on every registration.
	 */
	#first = $state<string | null>(null);
	/** False during the mount flush, true from the microtask after it — see `Bond.isSettled`. */
	settled = false;

	constructor(
		id: string,
		values: () => string[],
		set: (v: string[]) => void,
		multiple: () => boolean,
		collapsible: () => boolean,
		disabled: () => boolean
	) {
		this.id = id;
		this.#values = values;
		this.#set = set;
		this.#multiple = multiple;
		this.#collapsible = collapsible;
		this.#disabled = disabled;
	}
	get isDisabled() {
		return this.#disabled();
	}
	get multiple() {
		return this.#multiple();
	}
	isOpen(value: string) {
		return this.#values().includes(value);
	}
	toggle(value: string) {
		const open = this.isOpen(value);
		if (this.#multiple()) {
			this.#set(open ? this.#values().filter((v) => v !== value) : [...this.#values(), value]);
		} else if (open) {
			if (this.#collapsible()) this.#set([]);
		} else this.#set([value]);
	}
	/** Called at the item's init, so registration order is document order and the first header's
	 * first render already sees it. */
	attach(item: WbAccordionItem) {
		this.items.push(item);
		if (this.#first === null && !item.isDisabled) this.#first = item.id;
		return () => {
			const i = this.items.indexOf(item);
			if (i >= 0) this.items.splice(i, 1);
			if (this.#first === item.id) {
				this.#first = this.items.find((candidate) => !candidate.isDisabled)?.id ?? null;
			}
		};
	}
	/** Whether `item` holds the tab stop: the focused one, else the first enabled one. */
	isTabStop(item: WbAccordionItem): boolean {
		return (this.focused ?? this.#first) === item.id;
	}
	move(from: WbAccordionItem, key: string): boolean {
		const enabled = this.items.filter((i) => !i.isDisabled);
		const at = enabled.indexOf(from);
		let next: WbAccordionItem | undefined;
		if (key === 'ArrowDown') next = enabled[(at + 1) % enabled.length];
		else if (key === 'ArrowUp') next = enabled[(at - 1 + enabled.length) % enabled.length];
		else if (key === 'Home') next = enabled[0];
		else if (key === 'End') next = enabled[enabled.length - 1];
		if (!next) return false;
		this.focused = next.id;
		document.getElementById(next.headerId)?.focus({ preventScroll: true });
		return true;
	}
}

export class WbAccordionItem {
	readonly id: string;
	readonly root: WbAccordion;
	readonly headerId: string;
	readonly bodyId: string;
	#value: () => string | undefined;
	#disabled: () => boolean;

	constructor(
		root: WbAccordion,
		id: string,
		value: () => string | undefined,
		disabled: () => boolean
	) {
		this.root = root;
		this.id = id;
		this.headerId = Kernel.id(id, 'header');
		this.bodyId = Kernel.id(id, 'body');
		this.#value = value;
		this.#disabled = disabled;
	}
	get value() {
		return this.#value() ?? this.id;
	}
	get isDisabled() {
		return this.#disabled() || this.root.isDisabled;
	}
	get isOpen() {
		return this.root.isOpen(this.value);
	}
	toggle() {
		if (!this.isDisabled) this.root.toggle(this.value);
	}
}
