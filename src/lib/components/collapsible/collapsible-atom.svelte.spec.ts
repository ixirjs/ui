import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe, { capturedBond, resetCapturedBond } from './collapsible-atom-probe.svelte';
import { Atom } from '$svelte-atoms/core/shared/bond';
import {
	CollapsibleBond,
	CollapsibleBodyAtom,
	CollapsibleHeaderAtom,
	CollapsibleIndicatorAtom,
	CollapsibleRootAtom
} from './bond.svelte';

describe('Collapsible component-owned Atoms', () => {
	beforeEach(resetCapturedBond);

	it('self-constructs a merged CollapsibleBond via create()', () => {
		const bond = CollapsibleBond.create({ open: false, disabled: false });

		expect(bond).toBeInstanceOf(CollapsibleBond);
		expect(bond.state.props.open).toBe(false);
		expect((bond as unknown as Record<string, unknown>).header).toBeUndefined();
	});

	it('registers rendered part nodes without legacy generated atom methods', () => {
		const { unmount } = render(Probe);
		const bond = capturedBond;

		expect(bond).toBeDefined();
		expect((bond as unknown as Record<string, unknown>).root).toBeUndefined();
		expect((bond as unknown as Record<string, unknown>).header).toBeUndefined();
		expect((bond as unknown as Record<string, unknown>).body).toBeUndefined();
		expect((bond as unknown as Record<string, unknown>).indicator).toBeUndefined();
		expect(bond?.node('root')).toBeInstanceOf(CollapsibleRootAtom);
		expect(bond?.node('header')).toBeInstanceOf(CollapsibleHeaderAtom);
		expect(bond?.node('body')).toBeInstanceOf(CollapsibleBodyAtom);
		expect(bond?.node('indicator')).toBeInstanceOf(CollapsibleIndicatorAtom);
		for (const node of [
			bond?.node('root'),
			bond?.node('header'),
			bond?.node('body'),
			bond?.node('indicator')
		]) {
			expect(node).toBeInstanceOf(Atom);
		}
		expect(bond?.nodes()).toHaveLength(4);
		expect(
			bond
				?.node('header')
				?.describeCapabilities()
				.map((cap) => cap.description)
		).toContain('@svelte-atoms/collapsible:header');
		expect(
			bond
				?.node('body')
				?.describeCapabilities()
				.map((cap) => cap.description)
		).toContain('@svelte-atoms/collapsible:body');

		unmount();

		expect(bond?.nodes()).toEqual([]);
	});

	it('keeps Collapsible node capabilities without part-method adapters', () => {
		const bond = CollapsibleBond.create({ open: false, disabled: true });
		const header = new CollapsibleHeaderAtom(bond).role('trigger');
		const body = new CollapsibleBodyAtom(bond).role('content');
		const indicator = new CollapsibleIndicatorAtom(bond);

		for (const node of [header, body, indicator]) {
			expect(node).toBeInstanceOf(Atom);
		}

		expect(header.describeCapabilities().map((cap) => cap.description)).toContain(
			'@svelte-atoms/collapsible:header'
		);
		expect(header.spread.role).toBe('button');
		expect(header.spread.tabindex).toBe(-1);
		expect(header.spread['aria-disabled']).toBe('true');

		expect(body.describeCapabilities().map((cap) => cap.description)).toContain(
			'@svelte-atoms/collapsible:body'
		);
		expect(body.spread.role).toBe('region');
		expect(body.spread.inert).toBe(true);

		bond.state.props.open = true;
		expect(body.spread.inert).toBeUndefined();
		expect(indicator.spread.role).toBe('icon');
	});
});
