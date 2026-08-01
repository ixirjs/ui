import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe, {
	capturedBond,
	resetCapturedBond
} from '$ixirjs/ui/test/components/accordion/item/accordion-item-atom-probe.test.svelte';
import { Atom } from '$ixirjs/ui/shared/bond';
import {
	AccordionItemBodyAtom,
	AccordionItemBond,
	AccordionItemHeaderAtom,
	AccordionItemIndicatorAtom,
	AccordionItemRootAtom
} from './bond.svelte';
import { AccordionBond } from '$ixirjs/ui/components/accordion/bond.svelte';

describe('AccordionItem component-owned Atoms', () => {
	beforeEach(resetCapturedBond);

	it('registers rendered part nodes', () => {
		const { unmount } = render(Probe);
		const bond = capturedBond;

		expect(bond).toBeDefined();
		expect(bond).toBeInstanceOf(AccordionItemBond);
		expect(bond?.isOpen).toBe(true);

		const root = bond?.nodeByPart('root');
		const header = bond?.nodeByPart('header');
		const body = bond?.nodeByPart('body');
		const indicator = bond?.nodeByPart('indicator');

		expect(root).toBeInstanceOf(AccordionItemRootAtom);
		expect(header).toBeInstanceOf(AccordionItemHeaderAtom);
		expect(body).toBeInstanceOf(AccordionItemBodyAtom);
		expect(indicator).toBeInstanceOf(AccordionItemIndicatorAtom);
		for (const node of [root, header, body, indicator]) {
			expect(node).toBeInstanceOf(Atom);
		}
		expect(bond?.nodesByPart('root')).toEqual([root]);
		expect(bond?.nodesByPart('header')).toEqual([header]);
		expect(bond?.nodesByPart('body')).toEqual([body]);
		expect(bond?.nodesByPart('indicator')).toEqual([indicator]);

		const parent = bond?.parent as AccordionBond | undefined;
		expect(parent).toBeInstanceOf(AccordionBond);
		expect(parent?.items.get('one')).toBe(bond);

		expect(header?.capabilities.map((cap) => cap.slot.description)).toContain(
			'@ixirjs/accordion-item:header'
		);
		expect(body?.capabilities.map((cap) => cap.slot.description)).toContain(
			'@ixirjs/accordion-item:body'
		);
		expect(indicator?.capabilities.map((cap) => cap.slot.description)).toContain(
			'@ixirjs/accordion-item:indicator'
		);

		expect(header?.spread['aria-expanded']).toBe(true);
		expect(header?.spread['aria-controls']).toBe(body?.id);
		expect(body?.spread.role).toBe('region');
		expect(body?.spread['aria-labelledby']).toBe(header?.id);
		expect(body?.spread['aria-hidden']).toBe(false);

		expect(bond?.nodeByPart('root')).toBeInstanceOf(AccordionItemRootAtom);
		expect(bond?.nodeByPart('header')).toBeInstanceOf(AccordionItemHeaderAtom);
		expect(bond?.nodeByPart('body')).toBeInstanceOf(AccordionItemBodyAtom);
		expect(bond?.nodeByPart('indicator')).toBeInstanceOf(AccordionItemIndicatorAtom);
		for (const node of [
			bond?.nodeByPart('root'),
			bond?.nodeByPart('header'),
			bond?.nodeByPart('body'),
			bond?.nodeByPart('indicator')
		]) {
			expect(node).toBeInstanceOf(Atom);
		}

		unmount();

		for (const part of ['root', 'header', 'body', 'indicator']) {
			expect(bond?.nodesByPart(part)).toEqual([]);
		}
		expect(parent?.items.get('one')).toBeUndefined();
	});
});
