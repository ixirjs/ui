<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	// https://storybook.js.org/docs/writing-stories
	const { Story } = defineMeta({
		title: 'Atoms/Stepper',
		parameters: {
			// https://storybook.js.org/docs/configure/story-layout
			layout: 'fullscreen'
		},
		args: {
			linear: false,
			disabled: false,
			orientation: 'horizontal'
		},
		argTypes: {
			linear: {
				control: 'boolean',
				description: 'Enforce linear progression — only next/previous navigation is allowed'
			},
			disabled: {
				control: 'boolean',
				description: 'Disable all steps and navigation controls'
			},
			orientation: {
				control: 'select',
				options: ['horizontal', 'vertical'],
				description: 'Layout orientation of the step indicators'
			}
		}
	});

	type StepData = { header: string; body: string; completed: boolean; optional?: boolean };
</script>

<script lang="ts">
	import { Stepper, Step } from '$lib/components/stepper';
	import { Button } from '$lib/components/button';
	import { Textarea } from '$ixirjs/ui/components/textarea';
	import type { StepperBond } from '$ixirjs/ui/components/stepper/bond.svelte';
	import { Stack } from '$ixirjs/ui/components/stack';

	const steps = $state<StepData[]>([
		{
			header: 'Account Information',
			body: 'Enter your personal details',
			completed: false
		},
		{
			header: 'Address',
			body: 'Provide your shipping address',
			completed: false
		},
		{
			header: 'Payment',
			body: 'Select payment method',
			completed: false
		},
		{
			header: 'Review',
			body: 'Review and confirm',
			optional: true,
			completed: false
		}
	]);
	let activeStepIndex = $state(0);

	function handleNext(stepper: StepperBond) {
		stepper.navigation.next();
	}

	function handlePrevious(stepper: StepperBond) {
		stepper.navigation.previous();
	}

	function handleReset(stepper: StepperBond) {
		stepper.navigation.reset();
	}
</script>

<!-- Shared step content, teleported into Stepper.Body when its step is active. -->
{#snippet stepBody(stepData: StepData, i: number)}
	<Step.Body>
		<h3 class="text-xl font-semibold mb-4">Step {i + 1}: {stepData.header}</h3>
		<p class="text-muted-foreground mb-6">{stepData.body}</p>
		<div class="text-sm text-muted-foreground">Content for {stepData.header} step.</div>
	</Step.Body>
{/snippet}

<!-- Shared navigation footer — identical across orientations. -->
{#snippet navFooter(stepper: StepperBond)}
	<Stepper.Footer class="flex justify-between">
		<Button
			variant="outline"
			disabled={stepper.isFirstStep}
			onclick={() => handlePrevious(stepper)}
		>
			Previous
		</Button>
		<div class="flex gap-2">
			<Button variant="ghost" onclick={() => handleReset(stepper)}>Reset</Button>
			{#if stepper.isLastStep}
				<Button onclick={() => alert('Complete!')}>Complete</Button>
			{:else}
				<Button onclick={() => handleNext(stepper)}>Next</Button>
			{/if}
		</div>
	</Stepper.Footer>
{/snippet}

<!-- Shared horizontal step indicator + title. -->
{#snippet horizontalStep(stepData: StepData, i: number)}
	<Step.Root index={i} header={stepData.header} body={stepData.body}>
		{#snippet children({ step })}
			{@const isActive = step?.isActive}
			<Step.Header class="flex flex-col gap-2 flex-1">
				<div class="flex items-center w-full">
					<Step.Indicator />
					<Step.Separator />
				</div>
				<div class="flex flex-col pr-4">
					<Step.Title class={isActive ? 'text-foreground font-semibold' : 'text-muted-foreground'}>
						{stepData.header}
						{#if stepData.optional}<span class="text-xs">(Optional)</span>{/if}
					</Step.Title>
					<Step.Description>{stepData.body}</Step.Description>
				</div>
			</Step.Header>
			{@render stepBody(stepData, i)}
		{/snippet}
	</Step.Root>
{/snippet}

<!-- Real-world: a multi-step checkout wizard driven by the Storybook controls. -->
<Story name="Basic">
	{#snippet template(args)}
		<div class="p-8">
			<Stepper.Root bind:step={activeStepIndex} {...args}>
				{#snippet children({ stepper })}
					<Stepper.Header class="flex justify-between">
						{#each steps as stepData, i (i)}
							{@render horizontalStep(stepData, i)}
						{/each}
					</Stepper.Header>

					<Stepper.Body class="my-6">
						<Textarea.Root base={Stack.Root} class="overflow-hidden">
							<Stepper.Content base={Stack.Item} class="min-h-50 flex flex-col p-6" />
						</Textarea.Root>
					</Stepper.Body>

					{@render navFooter(stepper)}
				{/snippet}
			</Stepper.Root>
		</div>
	{/snippet}
</Story>

<!-- Linear mode: navigation is restricted to next/previous only. -->
<Story name="Horizontal" args={{}}>
	<div class="p-8">
		<Stepper.Root bind:step={activeStepIndex} linear={true}>
			{#snippet children({ stepper })}
				<Stepper.Header class="flex justify-between">
					{#each steps as stepData, i (i)}
						{@render horizontalStep(stepData, i)}
					{/each}
				</Stepper.Header>

				<Stepper.Body class="my-6">
					<Textarea.Root base={Stack.Root} class="overflow-hidden">
						<Stepper.Content base={Stack.Item} class="min-h-50 flex flex-col p-6" />
					</Textarea.Root>
				</Stepper.Body>

				{@render navFooter(stepper)}
			{/snippet}
		</Stepper.Root>
	</div>
</Story>

<Story name="Vertical" args={{}}>
	<Stepper.Root class="flex gap-4" step={1}>
		{#snippet children({ stepper })}
			<div class="flex gap-4">
				<Stepper.Header>
					{#each steps as stepData, i (i)}
						<Step.Root
							index={i}
							header={stepData.header}
							body={stepData.body}
							completed={stepData.completed}
							optional={stepData.optional ?? false}
						>
							<Step.Header class="flex w-full">
								<div class="flex gap-2">
									<div class="flex flex-col">
										<Step.Indicator />
										<Step.Separator class="w-0.5 min-h-10 translate-x-3.75" />
									</div>
									<div class="flex flex-col">
										<Step.Title>
											{stepData.header}
											{#if stepData.optional}<span class="text-xs">(Optional)</span>{/if}
										</Step.Title>
										<Step.Description>{stepData.body}</Step.Description>
									</div>
								</div>
							</Step.Header>
							{@render stepBody(stepData, i)}
						</Step.Root>
					{/each}
				</Stepper.Header>

				<Stepper.Body class="h-full">
					<Textarea.Root base={Stack.Root} class="overflow-hidden h-full min-w-96">
						<Stepper.Content base={Stack.Item} class="min-h-50 flex flex-col p-6" />
					</Textarea.Root>
				</Stepper.Body>
			</div>

			{@render navFooter(stepper)}
		{/snippet}
	</Stepper.Root>
</Story>
