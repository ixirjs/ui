<script lang="ts">
	import { Tabs, Tab } from '$lib/components/tabs';
	import { Button } from '$lib/components/button';

	// `value` is a bindable cell, so the active tab can be driven from outside the tab list —
	// a wizard's Next button, a route parameter, or a validation failure jumping to its step.
	const steps = [
		{ value: 'account', label: 'Account' },
		{ value: 'profile', label: 'Profile' },
		{ value: 'review', label: 'Review' }
	];

	let active = $state('account');
	const index = $derived(steps.findIndex((step) => step.value === active));
</script>

<div class="flex w-full max-w-lg flex-col gap-3">
	<Tabs.Root bind:value={active}>
		<Tabs.Header class="border-b">
			{#each steps as step (step.value)}
				<Tab.Root value={step.value}>
					<Tab.Header class="px-4 py-2 text-sm">{step.label}</Tab.Header>
					<Tab.Body class="p-4">
						<p class="text-muted-foreground text-sm">The {step.label} step.</p>
					</Tab.Body>
				</Tab.Root>
			{/each}
		</Tabs.Header>
		<Tabs.Body>
			<Tabs.Content />
		</Tabs.Body>
	</Tabs.Root>

	<div class="flex items-center gap-2">
		<Button
			size="sm"
			variant="outline"
			disabled={index <= 0}
			onclick={() => (active = steps[index - 1]!.value)}
		>
			Back
		</Button>
		<Button
			size="sm"
			disabled={index >= steps.length - 1}
			onclick={() => (active = steps[index + 1]!.value)}
		>
			Next
		</Button>
		<code class="text-muted-foreground text-xs">value = {active}</code>
	</div>
</div>
