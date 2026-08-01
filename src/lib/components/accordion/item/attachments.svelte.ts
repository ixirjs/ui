import { createBondTupleAttachment } from '$svelte-atoms/core/components/internal/attachments.svelte';
import { AccordionBond } from '../bond.svelte';
import { AccordionItemBond } from './bond.svelte';

const accordionItemAttachment = createBondTupleAttachment([AccordionItemBond, AccordionBond]);

export function accordionItem(
	callback: (
		node: HTMLElement,
		item?: AccordionItemBond,
		accordion?: AccordionBond
	) => void | (() => void)
) {
	return accordionItemAttachment((node, item, accordion) => callback(node, item, accordion));
}
