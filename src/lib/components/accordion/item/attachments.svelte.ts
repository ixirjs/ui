import { AccordionContext, type AccordionBond } from '$ixirjs/ui/components/accordion/bond.svelte';
import { AccordionItemContext, type AccordionItemBond } from './bond.svelte';

/**
 * An attachment that receives the item and accordion it is used under. Both contexts are read when
 * this is called — during a component's init — and handed to the callback at mount.
 */
export function accordionItem(
	callback: (
		node: HTMLElement,
		item?: AccordionItemBond,
		accordion?: AccordionBond
	) => void | (() => void)
) {
	const item = AccordionItemContext.get();
	const accordion = AccordionContext.get();
	return (node: HTMLElement) => callback(node, item, accordion);
}
