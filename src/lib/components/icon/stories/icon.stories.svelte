<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Icon } from '..';
	import ArrowDown from '$ixirjs/ui/icons/icon-arrow-down.svelte';
	import Checkmark from '$ixirjs/ui/icons/icon-checkmark.svelte';
	import Close from '$ixirjs/ui/icons/icon-close.svelte';

	const { Story } = defineMeta({
		title: 'Atoms/Icon',
		parameters: { layout: 'centered' }
	});
</script>

<Story name="Basic">
	<div class="flex items-center gap-4">
		<Icon src={Checkmark} class="text-success" aria-label="Completed" />
		<Icon src={ArrowDown} class="text-muted-foreground" aria-label="Expand" />
		<Icon src={Close} class="text-destructive" aria-label="Close" />
	</div>
</Story>

<Story name="Sizes">
	<div class="flex items-end gap-4">
		<Icon src={Checkmark} class="size-4 text-success" aria-label="Small completed" />
		<Icon src={Checkmark} class="size-6 text-success" aria-label="Completed" />
		<Icon src={Checkmark} class="size-10 text-success" aria-label="Large completed" />
	</div>
</Story>

<Story name="Custom Content">
	<Icon class="size-8 text-primary" aria-label="Sparkle">
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			aria-hidden="true"
		>
			<path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z" />
		</svg>
	</Icon>
</Story>

<!-- Real-world use: status and action affordances in a compact task row. -->
<Story name="Task Row">
	<div class="border-border bg-card flex w-96 items-center gap-3 rounded-lg border p-3">
		<Icon src={Checkmark} class="size-5 shrink-0 text-success" aria-label="Completed task" />
		<div class="min-w-0 flex-1">
			<p class="truncate text-sm font-medium">Publish the component authoring guide</p>
			<p class="text-muted-foreground text-xs">Completed by the design systems team</p>
		</div>
		<button
			class="text-muted-foreground hover:text-foreground rounded p-1"
			aria-label="Dismiss task"
		>
			<Icon src={Close} class="size-4" />
		</button>
	</div>
</Story>
