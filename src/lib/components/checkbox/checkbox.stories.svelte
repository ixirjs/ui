<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { default as CheckboxCmp } from './checkbox.svelte';

	const { Story } = defineMeta({
		title: 'Atoms/Checkbox',
		parameters: {
			layout: 'centered'
		},
		args: {
			checked: false,
			indeterminate: false,
			disabled: false
		},
		argTypes: {
			checked: { control: 'boolean', description: 'Whether the checkbox is checked' },
			indeterminate: { control: 'boolean', description: 'Whether the checkbox is in an indeterminate (mixed) state' },
			disabled: { control: 'boolean', description: 'Disable interaction with the checkbox' }
		}
	});
</script>

<script lang="ts">
	// Notification preferences
	let emailNotifs = $state(true);
	let pushNotifs = $state(false);
	let smsNotifs = $state(false);
	let weeklyDigest = $state(true);

	// Task list with select-all
	const tasks = $state([
		{ id: 1, label: 'Review pull request #142', done: true },
		{ id: 2, label: 'Update API documentation', done: false },
		{ id: 3, label: 'Fix responsive layout on mobile', done: true },
		{ id: 4, label: 'Write unit tests for auth module', done: false },
		{ id: 5, label: 'Deploy staging environment', done: false }
	]);

	const allChecked = $derived(tasks.every((t) => t.done));
	const someChecked = $derived(tasks.some((t) => t.done) && !allChecked);

	function toggleAll() {
		const newState = !allChecked;
		tasks.forEach((t) => (t.done = newState));
	}

	// Terms agreement
	let acceptTerms = $state(false);
	let acceptPrivacy = $state(false);
	const canSubmit = $derived(acceptTerms && acceptPrivacy);
</script>

<Story name="Basic">
	{#snippet template(args)}
		<label class="flex cursor-pointer items-center gap-2">
			<CheckboxCmp {...args} />
			<span class="text-foreground text-sm">Accept terms and conditions</span>
		</label>
	{/snippet}
</Story>

<Story name="Showcase">
	<div class="flex flex-col gap-8 p-6" style="width: 420px;">
		<!-- Settings panel -->
		<div class="border-border bg-card rounded-lg border">
			<div class="border-border border-b px-4 py-3">
				<h3 class="text-foreground text-sm font-semibold">Notification Preferences</h3>
				<p class="text-muted-foreground mt-0.5 text-xs">Choose how you'd like to be notified.</p>
			</div>
			<div class="flex flex-col gap-3 p-4">
				<label class="flex cursor-pointer items-center gap-3">
					<CheckboxCmp bind:checked={emailNotifs} />
					<div>
						<span class="text-foreground text-sm font-medium">Email notifications</span>
						<p class="text-muted-foreground text-xs">Receive updates via email</p>
					</div>
				</label>
				<label class="flex cursor-pointer items-center gap-3">
					<CheckboxCmp bind:checked={pushNotifs} />
					<div>
						<span class="text-foreground text-sm font-medium">Push notifications</span>
						<p class="text-muted-foreground text-xs">Browser and mobile push alerts</p>
					</div>
				</label>
				<label class="flex cursor-pointer items-center gap-3">
					<CheckboxCmp bind:checked={smsNotifs} />
					<div>
						<span class="text-foreground text-sm font-medium">SMS notifications</span>
						<p class="text-muted-foreground text-xs">Text message alerts for urgent items</p>
					</div>
				</label>
				<div class="border-border my-1 border-t"></div>
				<label class="flex cursor-pointer items-center gap-3">
					<CheckboxCmp bind:checked={weeklyDigest} />
					<div>
						<span class="text-foreground text-sm font-medium">Weekly digest</span>
						<p class="text-muted-foreground text-xs">Summary email every Monday</p>
					</div>
				</label>
			</div>
		</div>

		<!-- Task list with select-all (indeterminate) -->
		<div class="border-border bg-card rounded-lg border">
			<div class="border-border flex items-center gap-3 border-b px-4 py-3">
				<CheckboxCmp
					checked={allChecked}
					indeterminate={someChecked}
					onclick={toggleAll}
				/>
				<div>
					<h3 class="text-foreground text-sm font-semibold">Sprint Tasks</h3>
					<p class="text-muted-foreground text-xs">{tasks.filter((t) => t.done).length} of {tasks.length} completed</p>
				</div>
			</div>
			<div class="flex flex-col gap-1 p-2">
				{#each tasks as task (task.id)}
					<label class={[
						'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors',
						task.done ? 'bg-foreground/3' : 'hover:bg-foreground/5'
					]}>
						<CheckboxCmp bind:checked={task.done} />
						<span class={['text-sm transition-colors', task.done ? 'text-muted-foreground line-through' : 'text-foreground']}>
							{task.label}
						</span>
					</label>
				{/each}
			</div>
		</div>

		<!-- Terms agreement -->
		<div class="border-border bg-card rounded-lg border p-4">
			<h3 class="text-foreground mb-3 text-sm font-semibold">Terms & Conditions</h3>
			<div class="flex flex-col gap-3">
				<label class="flex cursor-pointer items-start gap-3">
					<div class="pt-0.5">
						<CheckboxCmp bind:checked={acceptTerms} />
					</div>
					<span class="text-foreground text-sm">
						I agree to the <span class="text-primary underline">Terms of Service</span> and understand the usage guidelines.
					</span>
				</label>
				<label class="flex cursor-pointer items-start gap-3">
					<div class="pt-0.5">
						<CheckboxCmp bind:checked={acceptPrivacy} />
					</div>
					<span class="text-foreground text-sm">
						I accept the <span class="text-primary underline">Privacy Policy</span> and consent to data processing.
					</span>
				</label>
			</div>
			<button
				class={[
					'mt-4 w-full rounded-lg py-2 text-sm font-medium transition-all',
					canSubmit
						? 'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer'
						: 'bg-muted text-muted-foreground cursor-not-allowed'
				]}
				disabled={!canSubmit}
			>
				{canSubmit ? 'Continue' : 'Accept both to continue'}
			</button>
		</div>
	</div>
</Story>
