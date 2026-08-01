<script lang="ts">
	import { Button } from '$lib/components/button';
	import { Stepper, Step } from '$lib/components/stepper';

	let activeStep = $state(0);

	const previewSteps = [
		{ header: 'Account', body: 'Enter your account details.' },
		{ header: 'Profile', body: 'Fill in your profile.' },
		{ header: 'Confirm', body: 'Review and submit.' }
	];

	const totalSteps = previewSteps.length;
	const isFirstStep = $derived(activeStep === 0);
	const isLastStep = $derived(activeStep === totalSteps - 1);
	const progressLabel = $derived(`Step ${activeStep + 1} of ${totalSteps}`);
</script>

<div class="w-full max-w-xs">
	<Stepper.Root bind:step={activeStep} class="gap-2" linear>
		<Stepper.Header class="flex justify-between">
			{#each previewSteps as stepData, i (i)}
				<Step.Root index={i} header={stepData.header} body={stepData.body}>
					<Step.Header class="flex flex-1 flex-col gap-1.5">
						<div class="flex w-full items-center">
							<Step.Indicator />
							{#if i < previewSteps.length - 1}
								<Step.Separator />
							{/if}
						</div>
						<Step.Title class="text-xs">{stepData.header}</Step.Title>
					</Step.Header>
				</Step.Root>
			{/each}
		</Stepper.Header>

		<Stepper.Body class="">
			{#each previewSteps as stepData, i (i)}
				<Stepper.Content value={i}>
					<p class="text-muted-foreground text-sm">{stepData.body}</p>
				</Stepper.Content>
			{/each}
		</Stepper.Body>

		<Stepper.Footer class="flex items-center justify-between gap-2">
			{#snippet children({ stepper })}
				<Button
					size="sm"
					variant="outline"
					class="h-7 text-xs"
					onclick={() => stepper.navigation.previous()}
					disabled={isFirstStep}
				>
					Prev
				</Button>

				<p class="text-muted-foreground text-xs">{progressLabel}</p>

				{#if isLastStep}
					<Button size="sm" class="h-7 text-xs" onclick={() => (activeStep = 0)}>Restart</Button>
				{:else}
					<Button size="sm" class="h-7 text-xs" onclick={() => stepper.navigation.next()}
						>Next</Button
					>
				{/if}
			{/snippet}
		</Stepper.Footer>
	</Stepper.Root>
</div>
