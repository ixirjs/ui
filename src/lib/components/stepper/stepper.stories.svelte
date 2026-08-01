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
</script>

<script lang="ts">
	import { Stepper, Step } from '$lib/components/stepper';
	import { Button } from '$lib/components/button';
	import { Textarea } from '../textarea';
	import type { StepperBond } from './bond.svelte';
	import { animate } from 'motion'
	import { Stack } from '../stack';

	const steps = $state([
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
		stepper.state.navigation.next();
	}

	function handlePrevious(stepper: StepperBond) {
		stepper.state.navigation.previous();
	}

	function handleReset(stepper: StepperBond) {
		stepper.state.navigation.reset();
	}
</script>

<Story name="Basic">
	{#snippet template(args)}
		<div class="p-8">
			<Stepper.Root bind:step={activeStepIndex} {...args}>
				{#snippet children({ stepper })}
					<!-- Header: Step indicators -->
					<Stepper.Header class="flex justify-between">
						{#each steps as stepData, i (i)}
							<Step.Root index={i} header={stepData.header} body={stepData.body}>
								{#snippet children({ step })}
									{@const isActive = step?.state?.isActive}

									<Step.Header class="flex flex-col gap-2 flex-1">
										<div class="flex items-center w-full">
											<Step.Indicator />
											<Step.Separator class="" />
										</div>

										<div class="flex flex-col pr-4">
											<Step.Title class={isActive
														? 'text-foreground font-semibold'
														: 'text-muted-foreground'}>
												{stepData?.header}
												{#if stepData?.optional}
													<span class="text-xs">(Optional)</span>
												{/if}
											</Step.Title>

											<Step.Description class={['text-xs text-muted-foreground']}>
												{stepData?.body}
											</Step.Description>
										</div>
									</Step.Header>

									<!-- Step Content (shown in Stepper.Body when active) -->
									<Step.Body>
										<h3 class="text-xl font-semibold mb-4">
											Step {i + 1}: {stepData.header}
										</h3>
										<p class="text-muted-foreground mb-6">{stepData.body}</p>

										<div class="text-sm text-muted-foreground">
											Content for {stepData.header} step...
										</div>
									</Step.Body>
								{/snippet}
							</Step.Root>
						{/each}
					</Stepper.Header>

					<!-- Body: Automatically renders active step content -->
					<Stepper.Body class="my-6">
						<Textarea.Root base={Stack.Root} class="overflow-hidden">
							<Stepper.Content
								base={Stack.Item}
								class="min-h-50 flex flex-col p-6"
								enter={(node) => {
									const duration = 0.4;
									animate(node, { opacity: [0, 1], y: [20, 0] }, { duration });
									return { duration: duration * 1000 };
								}}
								exit={(node) => {
									const duration = 0.3;
									animate(node, { opacity: [1, 0], y: [0, 0] }, { duration });
									return { duration: duration * 1000 };
								}}
							/>
						</Textarea.Root>
					</Stepper.Body>

					<!-- Footer: Navigation buttons -->
					<Stepper.Footer class="flex justify-between">
						<Button
							variant="outline"
							disabled={stepper.state.isFirstStep}
							onclick={() => handlePrevious(stepper)}
						>
							Previous
						</Button>

						<div class="flex gap-2">
							<Button variant="ghost" onclick={() => handleReset(stepper)}>Reset</Button>

							{#if stepper.state.isLastStep}
								<Button onclick={() => alert('Complete!')}>Complete</Button>
							{:else}
								<Button onclick={() => handleNext(stepper)}>Next</Button>
							{/if}
						</div>
					</Stepper.Footer>
				{/snippet}
			</Stepper.Root>
		</div>
	{/snippet}
</Story>

<Story name="Horizontal" args={{}}>
	<Stepper.Root bind:step={activeStepIndex} linear={true}>
		{#snippet children({ stepper })}
			<!-- Header: Step indicators -->
			<Stepper.Header class="flex justify-between">
					{#each steps as stepData, i (i)}
						<Step.Root index={i} header={stepData.header} body={stepData.body}>
							{#snippet children({ step })}
								{@const isActive = step?.state?.isActive}

								<Step.Header class="flex flex-col gap-2 flex-1">
									<div class="flex items-center w-full">
										<Step.Indicator />
										<Step.Separator class="" />
									</div>

									<div class="flex flex-col pr-4">
										<Step.Title class={isActive
													? 'text-foreground font-semibold'
													: 'text-muted-foreground'}>
												{stepData?.header}
												{#if stepData?.optional}
													<span class="text-xs">(Optional)</span>
												{/if}
										</Step.Title>

										<Step.Description class={['text-xs text-muted-foreground']}>
											{stepData?.body}
										</Step.Description>
									</div>
								</Step.Header>

								<!-- Step Content (shown in Stepper.Body when active) -->
								<Step.Body>
									<h3 class="text-xl font-semibold mb-4">
										Step {i + 1}: {stepData.header}
									</h3>
									<p class="text-muted-foreground mb-6">{stepData.body}</p>

									<!-- Actual step content would go here -->
									<div class="text-sm text-muted-foreground">
										Content for {stepData.header} step...
									</div>
								</Step.Body>
							{/snippet}
						</Step.Root>
					{/each}
			</Stepper.Header>

			<!-- Body: Automatically renders active step content -->
			<Stepper.Body class="my-6">
				<Textarea.Root base={Stack.Root} class="overflow-hidden">
					<Stepper.Content
						base={Stack.Item}
						class="min-h-50 flex flex-col p-6"
						enter={(node)=> {
							const duration = 0.4;
							animate(node, { opacity: [0, 1], y: [20, 0] }, { duration });
							return { duration: duration * 1000 };
						}}
						exit={(node)=> {
							const duration = 0.3;
							animate(node, { opacity: [1, 0], y: [0, 0] }, { duration });
							return { duration: duration * 1000 };
						}}
					/>
				</Textarea.Root>
			</Stepper.Body>

			<!-- Footer: Navigation buttons -->
			<Stepper.Footer class="flex justify-between">
				<Button
					variant="outline"
					disabled={stepper.state.isFirstStep}
					onclick={() => handlePrevious(stepper)}
				>
					Previous
				</Button>

				<div class="flex gap-2">
					<Button variant="ghost" onclick={() => handleReset(stepper)}>Reset</Button>

					{#if stepper.state.isLastStep}
						<Button onclick={() => alert('Complete!')}>Complete</Button>
					{:else}
						<Button onclick={() => handleNext(stepper)}>Next</Button>
					{/if}
				</div>
			</Stepper.Footer>
		{/snippet}
	</Stepper.Root>
</Story>

<Story name="Vertical" args={{}}>
	<Stepper.Root class="flex gap-4" step={1}>
			{#snippet children({ stepper })}
				<div class="flex gap-4">
					<Stepper.Header class="">
						{#each steps as stepData, i (i)}
							<Step.Root
								index={i}
								header={stepData.header}
								body={stepData.body}
								completed={stepData.completed}
								optional={stepData.optional ?? false}
							>
								{#snippet children()}
									<Step.Header class="flex w-full">
										<div class="flex gap-2">
											<div class="flex flex-col">
												<Step.Indicator class="" />
												<Step.Separator class="w-0.5 min-h-10 translate-x-3.75" />
											</div>
											<div class="flex flex-col">
												<Step.Title>
													{stepData.header}
													{#if stepData.optional}
														<span class="text-xs">(Optional)</span>
													{/if}
												</Step.Title>

												<Step.Description>
													{stepData.body}
												</Step.Description>
											</div>
										</div>

									</Step.Header>

									<!-- Step Content (shown in Stepper.Body when active) -->
									<Step.Body
										enter={(node)=> {
											const duration = 0.4;
											animate(node, { opacity: [0, 1], y: [20, 0] }, { duration });
											return { duration: duration * 1000 };
										}}
										exit={(node)=> {
											const duration = 0.2;
											animate(node, { opacity: [1, 0], y: [0, 0] }, { duration });
											return { duration: duration * 1000 };
										}}
									>
										<h3 class="text-xl font-semibold mb-4">
											Step {i + 1}: {stepData.header}
										</h3>
										<p class="text-muted-foreground mb-6">{stepData.body}</p>

										<!-- Actual step content would go here -->
										<div class="text-sm text-muted-foreground">
											Content for {stepData.header} step...
										</div>
									</Step.Body>
								{/snippet}
							</Step.Root>
						{/each}
					</Stepper.Header>

					<!-- Body: Automatically renders active step content -->
					<Stepper.Body class="h-full">
						<Textarea.Root base={Stack.Root} class="overflow-hidden h-full min-w-96">
							<Stepper.Content
								base={Stack.Item}
								class="min-h-50 flex flex-col p-6"
								enter={(node)=> {
									const duration = 0.4;
									animate(node, { opacity: [0, 1], y: [20, 0] }, { duration });
									return{duration: duration * 1000};
								}}
								exit={(node)=> {
									const duration = 0.3;
									animate(node, { opacity: [1, 0], y: [0, 0] }, { duration });
									return { duration: duration * 1000 };
								}}
							/>
						</Textarea.Root>
					</Stepper.Body>
				</div>

				<Stepper.Footer>
				<div class="flex justify-between">
					<Button
						variant="outline"
						disabled={stepper.state.isFirstStep}
						onclick={() => handlePrevious(stepper)}
					>
						Previous
					</Button>

					<div class="flex gap-2">
						<Button variant="ghost" onclick={() => handleReset(stepper)}>Reset</Button>

						{#if stepper.state.isLastStep}
							<Button onclick={() => alert('Complete!')}>Complete</Button>
						{:else}
							<Button onclick={() => handleNext(stepper)}>Next</Button>
						{/if}
					</div>
				</div>
			</Stepper.Footer>
			{/snippet}
	</Stepper.Root>
</Story>
