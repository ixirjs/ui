<script lang="ts" module>
	import type { StepperBond } from './bond.svelte';
	import type { StepBond } from './step/bond.svelte';

	export let capturedStepperBond: StepperBond | undefined;
	export let capturedStepBond: StepBond | undefined;

	export function resetCapturedBonds() {
		capturedStepperBond = undefined;
		capturedStepBond = undefined;
	}
</script>

<script lang="ts">
	import { Step, Stepper } from './index';

	function captureStepper(bond: StepperBond): string {
		capturedStepperBond = bond;
		return '';
	}

	function captureStep(bond: StepBond): string {
		capturedStepBond = bond;
		return '';
	}
</script>

<Stepper.Root step={0}>
	{#snippet children({ stepper }: { stepper: StepperBond })}
		{captureStepper(stepper)}
		<Stepper.Header>
			<Step.Root index={0}>
				{#snippet children({ step }: { step: StepBond })}
					{captureStep(step)}
					<Step.Indicator />
					<Step.Header>
						<Step.Title>Account</Step.Title>
						<Step.Description>Account details</Step.Description>
					</Step.Header>
					<Step.Separator />
					<Step.Body>
						<span>Body</span>
					</Step.Body>
				{/snippet}
			</Step.Root>
		</Stepper.Header>
		<Stepper.Body>
			<Stepper.Content />
		</Stepper.Body>
	{/snippet}
</Stepper.Root>
