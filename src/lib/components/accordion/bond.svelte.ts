/**
 * Accordion's shared object — a plain state class on the redesigned `Kernel`.
 *
 * Same surface the family always had (`{ accordion }`, `getBond`, `factory`, `open`/`close`/`toggle`,
 * `values`, `items`), none of the runtime. Items register at their init in document order; the
 * roving keyboard reads that order; the one reactive fact the headers share is which item holds the
 * tab stop. `docs/research/whiteboard-2026-08.md`.
 */
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import type { PresetLike } from '$ixirjs/ui/preset';
import type { StateChangeContext } from '$ixirjs/ui/types';

export type AccordionBondProps = {
	id?: string | undefined;
	values: string[];
	multiple?: boolean | undefined;
	collapsible?: boolean | undefined;
	disabled?: boolean | undefined;
	data?: unknown;
	presets?: { root?: PresetLike } | undefined;
};

/** What an item registers with the accordion. */
export interface AccordionItemHandle {
	readonly id: string;
	readonly headerId: string;
	readonly isDisabled: boolean;
}

/** The narrow parent contract an item depends on; keeps the child→parent seam stub-testable. */
export interface IAccordion {
	readonly id: string;
	readonly values: readonly string[];
	readonly isDisabled: boolean;
	readonly multiple: boolean;
	readonly collapsible: boolean;
	readonly focusedId: string | null;
	readonly settled: boolean;
	isValueOpen(value: string): boolean;
	notifyFocused(id: string): void;
	move(from: AccordionItemHandle, key: string): boolean;
	isTabStop(item: AccordionItemHandle): boolean;
	open(ids: string[]): void;
	close(ids: string[]): void;
	toggle(id: string): void;
	attachItem(id: string, item: AccordionItemHandle): () => void;
}

export const AccordionContext = Kernel.context<AccordionBond>('bond/accordion');

type Commit = (next: string[], context: StateChangeContext<AccordionBond>) => void;

export class AccordionBond implements IAccordion {
	readonly name = 'accordion';
	readonly props: AccordionBondProps;
	/** Mounted items in document order. */
	readonly items = new Map<string, AccordionItemHandle>();
	/** The header holding the roving tabindex, once one took focus. */
	#focused = $state<string | null>(null);
	/** The fallback tab stop — the first enabled item — written only when it changes. */
	#first = $state<string | null>(null);
	/** False during the root's mount flush, true from the microtask after it. */
	settled = false;
	#commit: Commit | undefined;

	constructor(props: AccordionBondProps) {
		this.props = props;
	}

	static create(props: AccordionBondProps): AccordionBond {
		return new AccordionBond(props);
	}

	/** @internal The root wires how a new value set is written and reported. */
	bindCommit(commit: Commit): void {
		this.#commit = commit;
	}

	get id(): string {
		return this.props.id ?? 'accordion';
	}
	get values(): readonly string[] {
		return this.props.values;
	}
	get isDisabled(): boolean {
		return this.props.disabled ?? false;
	}
	get multiple(): boolean {
		return this.props.multiple ?? false;
	}
	get collapsible(): boolean {
		return this.props.collapsible ?? false;
	}
	get focusedId(): string | null {
		return this.#focused ?? this.#first;
	}
	/** Mounted items for the open values, in values order. */
	get activeItems(): readonly (AccordionItemHandle | undefined)[] {
		return this.props.values.map((value) => this.items.get(value));
	}

	isValueOpen(value: string): boolean {
		return this.props.values.includes(value);
	}
	#set(next: string[]): void {
		const current = this.props.values;
		if (next.length === current.length && next.every((v, i) => v === current[i])) return;
		this.#commit?.(next, { bond: this });
	}
	open(ids: string[]): void {
		if (this.multiple) {
			const next = [...this.props.values];
			for (const id of ids) if (!next.includes(id)) next.push(id);
			this.#set(next);
		} else this.#set(ids.slice(0, 1));
	}
	close(ids: string[]): void {
		this.#set(this.props.values.filter((v) => !ids.includes(v)));
	}
	toggle(id: string): void {
		const open = this.isValueOpen(id);
		if (this.multiple) {
			if (open) this.close([id]);
			else this.open([id]);
		} else if (open) {
			if (this.collapsible) this.#set([]);
		} else this.#set([id]);
	}

	attachItem(id: string, item: AccordionItemHandle): () => void {
		this.items.set(id, item);
		if (this.#first === null && !item.isDisabled) this.#first = id;
		return () => {
			this.items.delete(id);
			if (this.#first === id) this.#first = this.#firstEnabled()?.id ?? null;
			if (this.#focused === id) this.#focused = null;
		};
	}
	#firstEnabled(): AccordionItemHandle | undefined {
		for (const item of this.items.values()) if (!item.isDisabled) return item;
		return undefined;
	}
	isTabStop(item: AccordionItemHandle): boolean {
		return this.focusedId === item.id;
	}
	notifyFocused(id: string): void {
		this.#focused = id;
	}
	focusHeader(id: string | null): void {
		if (id === null || typeof document === 'undefined') return;
		const header = this.items.get(id)?.headerId;
		if (header) document.getElementById(header)?.focus({ preventScroll: true });
	}
	/** Arrow/Home/End over the enabled headers, wrapping. Returns whether the key was handled. */
	move(from: AccordionItemHandle, key: string): boolean {
		const enabled = [...this.items.values()].filter((item) => !item.isDisabled);
		if (enabled.length === 0) return false;
		const at = enabled.indexOf(from);
		let next: AccordionItemHandle | undefined;
		if (key === 'ArrowDown') next = enabled[(at + 1) % enabled.length];
		else if (key === 'ArrowUp') next = enabled[(at - 1 + enabled.length) % enabled.length];
		else if (key === 'Home') next = enabled[0];
		else if (key === 'End') next = enabled[enabled.length - 1];
		if (!next) return false;
		this.#focused = next.id;
		this.focusHeader(next.id);
		return true;
	}
}
