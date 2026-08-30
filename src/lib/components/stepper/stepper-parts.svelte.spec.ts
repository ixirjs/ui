import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Probe, {
	capturedStepBond,
	capturedStepperBond,
	resetCapturedBonds
} from '$ixirjs/ui/test/components/stepper/stepper-atom-probe.test.svelte';
import { StepperBond } from './bond.svelte';
import { StepBond } from './step/bond.svelte';

// The stepper's contract, as the DOM and the parent see it — what the old Atom spec asserted
// through registries and spreads.
describe('Stepper parts', () => {
	beforeEach(resetCapturedBonds);

	it('registers the step and renders every part with its status and labelling', () => {
		const { unmount } = render(Probe);
		const stepper = capturedStepperBond!;
		const step = capturedStepBond!;

		expect(stepper).toBeInstanceOf(StepperBond);
		expect(step).toBeInstanceOf(StepBond);
		expect(stepper.props.step).toBe(0);
		expect(step.props.index).toBe(0);
		expect(stepper.steps.get('0')).toBe(step);

		const root = document.getElementById(stepper.rootId)!;
		const indicator = document.getElementById(step.partId('indicator'))!;
		const header = document.getElementById(step.partId('header'))!;
		const title = document.getElementById(step.partId('title'))!;
		const description = document.getElementById(step.partId('description'))!;
		const separator = document.getElementById(step.partId('separator'))!;

		expect(root.getAttribute('role')).toBe('group');
		expect(indicator.getAttribute('role')).toBe('presentation');
		expect(indicator.getAttribute('aria-current')).toBe('step');
		expect(indicator.getAttribute('data-active')).toBe('true');
		// The header is the step's rendered container: the group and its labelling land here.
		expect(header.getAttribute('role')).toBe('group');
		expect(header.getAttribute('data-active')).toBe('true');
		expect(header.getAttribute('aria-labelledby')).toBe(title.id);
		expect(header.getAttribute('aria-describedby')).toBe(description.id);
		expect(separator.getAttribute('role')).toBe('presentation');
		expect(separator.getAttribute('aria-hidden')).toBe('true');
		expect(separator.getAttribute('data-active')).toBe('true');
		// Step.Root is renderless; Step.Body registers content, rendered by Stepper.Content.
		expect(document.getElementById(step.partId('root'))).toBeNull();
		expect(stepper.stepContents.get('0')).toBeDefined();

		unmount();

		expect(stepper.steps.get('0')).toBeUndefined();
		expect(stepper.stepContents.get('0')).toBeUndefined();
	});
});
