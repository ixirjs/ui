import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe, {
	capturedStepBond,
	capturedStepperBond,
	resetCapturedBonds
} from './stepper-atom-probe.svelte';
import { Atom } from '$svelte-atoms/core/shared/bond';
import { StepperBond, StepperRootAtom } from './bond.svelte';
import {
	StepBodyAtom,
	StepBond,
	StepDescriptionAtom,
	StepHeaderAtom,
	StepIndicatorAtom,
	StepRootAtom,
	StepSeparatorAtom,
	StepTitleAtom
} from './step/bond.svelte';

describe('Stepper component-owned Atoms', () => {
	beforeEach(resetCapturedBonds);

	it('registers rendered stepper and step nodes', () => {
		const { unmount } = render(Probe);
		const stepper = capturedStepperBond;
		const step = capturedStepBond;

		expect(stepper).toBeDefined();
		expect(step).toBeDefined();
		expect(stepper).toBeInstanceOf(StepperBond);
		expect(step).toBeInstanceOf(StepBond);
		expect(stepper?.props.step).toBe(0);
		expect(step?.props.index).toBe(0);

		const stepperRoot = stepper?.node('root');
		const stepRoot = step?.node('root');
		const indicator = step?.node('indicator');
		const header = step?.node('header');
		const title = step?.node('title');
		const description = step?.node('description');
		const separator = step?.node('separator');
		const body = step?.node('body');

		expect(stepperRoot).toBeInstanceOf(StepperRootAtom);
		expect(stepRoot).toBeInstanceOf(StepRootAtom);
		expect(indicator).toBeInstanceOf(StepIndicatorAtom);
		expect(header).toBeInstanceOf(StepHeaderAtom);
		expect(title).toBeInstanceOf(StepTitleAtom);
		expect(description).toBeInstanceOf(StepDescriptionAtom);
		expect(separator).toBeInstanceOf(StepSeparatorAtom);
		expect(body).toBeInstanceOf(StepBodyAtom);
		for (const node of [
			stepperRoot,
			stepRoot,
			indicator,
			header,
			title,
			description,
			separator,
			body
		]) {
			expect(node).toBeInstanceOf(Atom);
		}
		expect(stepper?.nodes()).toHaveLength(1);
		expect(step?.nodes()).toHaveLength(7);
		expect(stepper?.steps.get('0')).toBe(step);

		expect(stepperRoot?.spread.role).toBe('group');
		expect(stepRoot?.spread.role).toBe('group');
		expect(stepRoot?.spread['data-stepper']).toBe(stepper?.id);
		expect(stepRoot?.spread['data-active']).toBe(true);
		expect(indicator?.spread.role).toBe('presentation');
		expect(indicator?.spread['aria-current']).toBe('step');
		expect(header?.spread['data-active']).toBe(true);
		expect(body?.spread['data-active']).toBe(true);
		expect(separator?.spread.role).toBe('presentation');
		expect(separator?.spread['aria-hidden']).toBe('true');

		expect(typeof stepper?.root).toBe('function');
		expect(typeof step?.root).toBe('function');
		expect(typeof step?.indicator).toBe('function');
		expect(typeof step?.header).toBe('function');
		expect(typeof step?.title).toBe('function');
		expect(typeof step?.description).toBe('function');
		expect(typeof step?.body).toBe('function');
		expect(typeof step?.separator).toBe('function');
		expect(stepper?.root()).toBeInstanceOf(StepperRootAtom);
		expect(step?.root()).toBeInstanceOf(StepRootAtom);
		expect(step?.indicator()).toBeInstanceOf(StepIndicatorAtom);
		expect(step?.header()).toBeInstanceOf(StepHeaderAtom);
		expect(step?.title()).toBeInstanceOf(StepTitleAtom);
		expect(step?.description()).toBeInstanceOf(StepDescriptionAtom);
		expect(step?.body()).toBeInstanceOf(StepBodyAtom);
		expect(step?.separator()).toBeInstanceOf(StepSeparatorAtom);
		for (const node of [
			stepper?.root(),
			step?.root(),
			step?.indicator(),
			step?.header(),
			step?.title(),
			step?.description(),
			step?.body(),
			step?.separator()
		]) {
			expect(node).toBeInstanceOf(Atom);
		}

		unmount();

		expect(stepper?.nodes()).toEqual([]);
		expect(step?.nodes()).toEqual([]);
		expect(stepper?.steps.get('0')).toBeUndefined();
	});
});
