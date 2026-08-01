import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe, { capturedBond, resetCapturedBond } from './popover-atom-probe.svelte';
import { Atom } from '$svelte-atoms/core/shared/bond';
import {
	PopoverArrowAtom,
	PopoverBond,
	PopoverContentAtom,
	PopoverIndicatorAtom,
	PopoverOverlayAtom,
	PopoverTriggerAtom
} from './bond.svelte';

describe('Popover component-owned Atoms', () => {
	beforeEach(resetCapturedBond);

	it('registers rendered popover nodes', () => {
		const { unmount } = render(Probe);
		const popover = capturedBond;

		expect(popover).toBeDefined();
		expect(popover).toBeInstanceOf(PopoverBond);
		expect(popover?.isOpen).toBe(true);
		expect(popover?.shouldTrackPosition).toBe(true);

		const trigger = popover?.node('trigger');
		const overlay = popover?.node('overlay');
		const content = popover?.node('content');
		const arrow = popover?.node('arrow');
		const indicator = popover?.node('indicator');

		expect(trigger).toBeInstanceOf(PopoverTriggerAtom);
		expect(overlay).toBeInstanceOf(PopoverOverlayAtom);
		expect(content).toBeInstanceOf(PopoverContentAtom);
		expect(arrow).toBeInstanceOf(PopoverArrowAtom);
		expect(indicator).toBeInstanceOf(PopoverIndicatorAtom);
		for (const node of [trigger, overlay, content, arrow, indicator]) {
			expect(node).toBeInstanceOf(Atom);
		}
		expect(popover?.nodes()).toHaveLength(5);

		expect(overlay?.spread.role).toBe('dialog');
		expect(overlay?.spread['data-active']).toBe(true);
		expect(content?.spread['data-active']).toBe(true);
		expect(arrow?.spread.role).toBe('presentation');
		expect(indicator?.spread['aria-hidden']).toBe(true);

		const legacyNodes = [
			popover?.trigger(),
			popover?.overlay(),
			popover?.content(),
			popover?.arrow(),
			popover?.indicator()
		];
		for (const node of legacyNodes) {
			expect(node).toBeInstanceOf(Atom);
		}
		expect(legacyNodes[0]).toBeInstanceOf(PopoverTriggerAtom);
		expect(legacyNodes[1]).toBeInstanceOf(PopoverOverlayAtom);
		expect(legacyNodes[2]).toBeInstanceOf(PopoverContentAtom);

		unmount();

		expect(popover?.nodes()).toEqual([]);
	});
});
