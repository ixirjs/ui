import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe, { capturedBond, resetCapturedBond } from './accordion-item-atom-probe.svelte';
import { Atom } from '$svelte-atoms/core/shared/bond';
import {
	AccordionItemBodyAtom,
	AccordionItemBond,
	AccordionItemHeaderAtom,
	AccordionItemIndicatorAtom,
	AccordionItemRootAtom
} from './bond.svelte';
import { AccordionBond } from '../bond.svelte';

describe('AccordionItem component-owned Atoms', () => {
	beforeEach(resetCapturedBond);

	it('registers rendered part nodes', () => {
		const { unmount } = render(Probe);
		const bond = capturedBond;

		expect(bond).toBeDefined();
		expect(bond).toBeInstanceOf(AccordionItemBond);
		expect(bond?.isOpen).toBe(true);

		const root = bond?.node('root');
		const header = bond?.node('header');
		const body = bond?.node('body');
		const indicator = bond?.node('indicator');

		expect(root).toBeInstanceOf(AccordionItemRootAtom);
		expect(header).toBeInstanceOf(AccordionItemHeaderAtom);
		expect(body).toBeInstanceOf(AccordionItemBodyAtom);
		expect(indicator).toBeInstanceOf(AccordionItemIndicatorAtom);
		for (const node of [root, header, body, indicator]) {
			expect(node).toBeInstanceOf(Atom);
		}
		expect(bond?.nodes()).toHaveLength(4);

		const parent = bond?.parent as AccordionBond | undefined;
		expect(parent).toBeInstanceOf(AccordionBond);
		expect(parent?.items.get('one')).toBe(bond);

		expect(header?.describeCapabilities().map((cap) => cap.description)).toContain(
			'@svelte-atoms/accordion-item:header'
		);
		expect(body?.describeCapabilities().map((cap) => cap.description)).toContain(
			'@svelte-atoms/accordion-item:body'
		);
		expect(indicator?.describeCapabilities().map((cap) => cap.description)).toContain(
			'@svelte-atoms/accordion-item:indicator'
		);

		expect(header?.spread['aria-expanded']).toBe(true);
		expect(header?.spread['aria-controls']).toBe(body?.id);
		expect(body?.spread.role).toBe('region');
		expect(body?.spread['aria-labelledby']).toBe(header?.id);
		expect(body?.spread['aria-hidden']).toBe(false);

		expect(typeof bond?.root).toBe('function');
		expect(typeof bond?.header).toBe('function');
		expect(typeof bond?.body).toBe('function');
		expect(typeof bond?.indicator).toBe('function');
		expect(bond?.root()).toBeInstanceOf(AccordionItemRootAtom);
		expect(bond?.header()).toBeInstanceOf(AccordionItemHeaderAtom);
		expect(bond?.body()).toBeInstanceOf(AccordionItemBodyAtom);
		expect(bond?.indicator()).toBeInstanceOf(AccordionItemIndicatorAtom);
		for (const node of [bond?.root(), bond?.header(), bond?.body(), bond?.indicator()]) {
			expect(node).toBeInstanceOf(Atom);
		}

		unmount();

		expect(bond?.nodes()).toEqual([]);
		expect(parent?.items.get('one')).toBeUndefined();
	});
});
