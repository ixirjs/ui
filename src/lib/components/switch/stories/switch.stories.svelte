<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { default as SwitchCmp } from '../switch.svelte';

	const { Story } = defineMeta({
		title: 'Atoms/Switch',
		parameters: { layout: 'centered' },
		args: {
			checked: false,
			disabled: false
		},
		argTypes: {
			checked: { control: 'boolean', description: 'Whether the switch is on (bindable)' },
			disabled: { control: 'boolean', description: 'Prevent interaction and dim the control' }
		}
	});
</script>

<script lang="ts">
	let checked = $state(false);

	let notifications = $state(true);
	let changeLog = $state<{ id: number; text: string }[]>([]);
	let nextId = 0;

	function logChange(_ev?: Event, detail?: { checked: boolean }) {
		changeLog = [
			{ id: nextId++, text: `onchange → checked: ${detail?.checked}` },
			...changeLog
		].slice(0, 4);
	}
</script>

<Story name="Basic">
	{#snippet template(args)}
		<SwitchCmp {...args} />
	{/snippet}
</Story>

<!--
	Controlled: bind the `checked` prop to local state and read it back live.
	This is the primary API — `bind:checked` keeps the switch and your state in sync.
-->
<Story name="Controlled">
	<div class="flex w-72 flex-col gap-4">
		<div class="flex items-center justify-between">
			<span class="text-sm font-medium">Airplane mode</span>
			<SwitchCmp bind:checked />
		</div>
		<div
			class="bg-muted/50 text-muted-foreground flex items-center justify-between rounded-md border px-3 py-2 text-xs"
		>
			<code class="font-mono">bind:checked</code>
			<span class="tabular-nums" class:text-foreground={checked}>{checked}</span>
		</div>
	</div>
</Story>

<!--
	Event callback: `onchange` fires after each toggle with `{ checked }`.
	Use it when you need a side effect rather than two-way binding.
-->
<Story name="Change Event">
	<div class="flex w-72 flex-col gap-4">
		<div class="flex items-center justify-between">
			<span class="text-sm font-medium">Enable notifications</span>
			<SwitchCmp bind:checked={notifications} onchange={logChange} />
		</div>
		<div class="bg-muted/50 flex min-h-24 flex-col gap-1 rounded-md border p-3 text-xs">
			<span class="text-muted-foreground mb-1 font-medium">Event log</span>
			{#if changeLog.length === 0}
				<span class="text-muted-foreground italic">Toggle the switch…</span>
			{:else}
				{#each changeLog as entry (entry.id)}
					<code class="font-mono">{entry.text}</code>
				{/each}
			{/if}
		</div>
	</div>
</Story>

<Story name="States">
	{#snippet template()}
		<div class="flex flex-col gap-4">
			<div class="flex items-center gap-3">
				<SwitchCmp />
				<span class="text-sm">Off</span>
			</div>

			<div class="flex items-center gap-3">
				<SwitchCmp checked={true} />
				<span class="text-sm">On</span>
			</div>

			<div class="flex items-center gap-3">
				<SwitchCmp disabled />
				<span class="text-muted-foreground text-sm">Disabled off</span>
			</div>

			<div class="flex items-center gap-3">
				<SwitchCmp checked={true} disabled />
				<span class="text-muted-foreground text-sm">Disabled on</span>
			</div>
		</div>
	{/snippet}
</Story>
