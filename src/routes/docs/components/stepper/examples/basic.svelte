<script lang="ts">
	import { Stepper, Step } from '$lib/components/stepper';
	import { Button } from '$lib/components/button';

	const steps = [
		{ header: 'Account', body: 'Enter your account details.' },
		{ header: 'Profile', body: 'Fill in your profile information.' },
		{ header: 'Confirm', body: 'Review and submit.' }
	];

	let activeStep = $state(0);
</script>

<div class="w-full max-w-lg">
	<Stepper.Root bind:step={activeStep} linear>
		<Stepper.Header class="flex justify-between">
			{#each steps as stepData, i (i)}
				<Step.Root index={i} header={stepData.header} body={stepData.body}>
					<Step.Header class="flex flex-1 flex-col gap-2">
						<div class="flex w-full items-center">
							<Step.Indicator />
							{#if i < steps.length - 1}
								<Step.Separator />
							{/if}
						</div>
						<Step.Title class="text-xs">{stepData.header}</Step.Title>
					</Step.Header>
				</Step.Root>
			{/each}
		</Stepper.Header>

		<Stepper.Body class="mt-4">
			{#each steps as stepData, i (i)}
				<Stepper.Content value={i}>
					<p class="text-muted-foreground py-4 text-sm">{stepData.body}</p>
				</Stepper.Content>
			{/each}
		</Stepper.Body>

		<Stepper.Footer class="mt-4 flex justify-between">
			{#snippet children({ stepper })}
				<Button
					variant="outline"
					onclick={() => stepper.navigation.previous()}
					disabled={activeStep === 0}
				>
					Previous
				</Button>
				<Button
					onclick={() => stepper.navigation.next()}
					disabled={activeStep === steps.length - 1}
				>
					Next
				</Button>
			{/snippet}
		</Stepper.Footer>
	</Stepper.Root>
</div>
