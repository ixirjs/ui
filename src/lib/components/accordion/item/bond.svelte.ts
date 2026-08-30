/**
 * An accordion item's shared object. Registered with the parent at the root's init (document
 * order); its ids derive from `value` so a consumer can address them, exactly as before.
 */
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import type { PresetLike } from '$ixirjs/ui/preset';
import {
	AccordionContext,
	type AccordionItemHandle,
	type IAccordion
} from '$ixirjs/ui/components/accordion/bond.svelte';

export type AccordionItemBondProps = {
	id?: string | undefined;
	value?: string | undefined;
	disabled?: boolean | undefined;
	data?: unknown;
	presets?: { root?: PresetLike; header?: PresetLike; body?: PresetLike } | undefined;
};

export const AccordionItemContext = Kernel.context<AccordionItemBond>('bond/accordion-item');

export class AccordionItemBond implements AccordionItemHandle {
	readonly name = 'accordion-item';
	readonly props: AccordionItemBondProps;
	readonly #parent: IAccordion;

	constructor(props: AccordionItemBondProps, parent?: IAccordion) {
		this.props = props;
		const resolved = parent ?? AccordionContext.get();
		if (!resolved) throw new Error('AccordionItem.Root must be used within an <Accordion>.');
		this.#parent = resolved;
	}

	static create(props: AccordionItemBondProps): AccordionItemBond {
		return new AccordionItemBond(props);
	}

	/** `value`, or the seed — the ids below derive from it. */
	get id(): string {
		return this.props.value ?? this.props.id ?? 'accordion-item';
	}
	get rootId(): string {
		return Kernel.id(this.id, 'accordion-item-root');
	}
	get headerId(): string {
		return Kernel.id(this.id, 'accordion-item-header');
	}
	get bodyId(): string {
		return Kernel.id(this.id, 'accordion-item-body');
	}
	get indicatorId(): string {
		return Kernel.id(this.id, 'accordion-item-indicator');
	}
	get parent(): IAccordion {
		return this.#parent;
	}
	get accordionId(): string {
		return this.#parent.id;
	}
	get isOpen(): boolean {
		return this.#parent.isValueOpen(this.id);
	}
	get isDisabled(): boolean {
		return this.props.disabled || this.#parent.isDisabled || false;
	}
	get isActive(): boolean {
		return !this.isDisabled && this.isOpen;
	}
	open(): void {
		this.#parent.open([this.id]);
	}
	close(): void {
		this.#parent.close([this.id]);
	}
	toggle(): void {
		this.#parent.toggle(this.id);
	}
}
