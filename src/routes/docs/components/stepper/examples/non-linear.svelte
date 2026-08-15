<script lang="ts">
	import { Stepper, Step } from '$lib/components/stepper';

	// Without `linear`, every step header is directly reachable — the right default for a settings
	// flow or a review screen, where the user may already know which step they need. `linear` is
	// for the case where a later step genuinely cannot be filled in before an earlier one.
	const steps = [
		{ header: 'Shipping', body: 'Where should the order go?' },
		{ header: 'Payment', body: 'How would you like to pay?' },
		{ header: 'Review', body: 'Check the order before submitting.' }
	];

	let activeStep = $state(0);
</script>

<div class="flex w-full max-w-lg flex-col gap-2">
	<Stepper.Root bind:step={activeStep}>
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
					<Step.Body>
						<p class="text-muted-foreground py-4 text-sm">{stepData.body}</p>
					</Step.Body>
				</Step.Root>
			{/each}
		</Stepper.Header>

		<Stepper.Body class="mt-4">
			<Stepper.Content />
		</Stepper.Body>
	</Stepper.Root>

	<code class="text-muted-foreground text-xs">step = {activeStep} — click any header</code>
</div>
