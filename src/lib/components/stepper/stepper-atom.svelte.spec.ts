import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe, {
	capturedStepBond,
	capturedStepperBond,
	resetCapturedBonds
} from '$ixirjs/ui/test/components/stepper/stepper-atom-probe.test.svelte';
import { Atom } from '$ixirjs/ui/shared/bond';
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

		const stepperRoot = stepper?.nodeByPart('root');
		const stepRoot = step?.nodeByPart('root');
		const indicator = step?.nodeByPart('indicator');
		const header = step?.nodeByPart('header');
		const title = step?.nodeByPart('title');
		const description = step?.nodeByPart('description');
		const separator = step?.nodeByPart('separator');
		const body = step?.nodeByPart('body');

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
		expect(stepper?.nodesByPart('root')).toEqual([stepperRoot]);
		expect(step?.nodesByPart('root')).toEqual([stepRoot]);
		expect(step?.nodesByPart('indicator')).toEqual([indicator]);
		expect(step?.nodesByPart('header')).toEqual([header]);
		expect(step?.nodesByPart('title')).toEqual([title]);
		expect(step?.nodesByPart('description')).toEqual([description]);
		expect(step?.nodesByPart('separator')).toEqual([separator]);
		expect(step?.nodesByPart('body')).toEqual([body]);
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

		expect(stepper?.nodeByPart('root')).toBeInstanceOf(StepperRootAtom);
		expect(step?.nodeByPart('root')).toBeInstanceOf(StepRootAtom);
		expect(step?.nodeByPart('indicator')).toBeInstanceOf(StepIndicatorAtom);
		expect(step?.nodeByPart('header')).toBeInstanceOf(StepHeaderAtom);
		expect(step?.nodeByPart('title')).toBeInstanceOf(StepTitleAtom);
		expect(step?.nodeByPart('description')).toBeInstanceOf(StepDescriptionAtom);
		expect(step?.nodeByPart('body')).toBeInstanceOf(StepBodyAtom);
		expect(step?.nodeByPart('separator')).toBeInstanceOf(StepSeparatorAtom);
		for (const node of [
			stepper?.nodeByPart('root'),
			step?.nodeByPart('root'),
			step?.nodeByPart('indicator'),
			step?.nodeByPart('header'),
			step?.nodeByPart('title'),
			step?.nodeByPart('description'),
			step?.nodeByPart('body'),
			step?.nodeByPart('separator')
		]) {
			expect(node).toBeInstanceOf(Atom);
		}

		unmount();

		expect(stepper?.nodesByPart('root')).toEqual([]);
		for (const part of [
			'root',
			'indicator',
			'header',
			'title',
			'description',
			'separator',
			'body'
		]) {
			expect(step?.nodesByPart(part)).toEqual([]);
		}
		expect(stepper?.steps.get('0')).toBeUndefined();
	});
});
