<script lang="ts">
	import { Step, Stepper } from '$ixirjs/ui/components/stepper';
	import { Button } from '$ixirjs/ui/components/button';

	const steps = [
		{ header: 'Account', body: 'Enter account details.' },
		{ header: 'Profile', body: 'Fill in profile details.' },
		{ header: 'Confirm', body: 'Review and submit.' }
	];

	let activeStep = $state(0);
</script>

<Stepper.Root bind:step={activeStep} linear>
	<Stepper.Header>
		{#each steps as stepData, index (index)}
			<Step.Root {index}>
				<Step.Header>
					<Step.Indicator />
					<Step.Title>{stepData.header}</Step.Title>
				</Step.Header>
				{@render stepBody(stepData, index)}
			</Step.Root>
		{/each}
	</Stepper.Header>
	<Stepper.Body>
		<Stepper.Content />
	</Stepper.Body>
	<Stepper.Footer>
		{#snippet children({ stepper })}
			<Button data-testid="next" onclick={() => stepper.navigation.next()}>Next</Button>
		{/snippet}
	</Stepper.Footer>
</Stepper.Root>

{#snippet stepBody(stepData: (typeof steps)[number], index: number)}
	<Step.Body>
		<p data-testid="step-content">Step {index + 1}: {stepData.body}</p>
	</Step.Body>
{/snippet}
