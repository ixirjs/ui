<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { default as SwitchCmp } from '$ixirjs/ui/components/switch/switch.svelte';

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
			{ id: nextId++, text: `onchange fired — checked: ${detail?.checked}` },
			...changeLog
		].slice(0, 4);
	}

	// Real-world: a small account-settings surface driven by bound switches.
	let settings = $state({
		emailDigest: true,
		productUpdates: false,
		twoFactor: true
	});
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

<!--
	Real-world: an account settings card. Each row binds a switch to a field on
	`settings`, and the summary line reads the same state back.
-->
<Story name="Settings Panel">
	{#snippet template()}
		{@const rows = [
			{
				key: 'emailDigest',
				title: 'Weekly email digest',
				desc: 'A summary of activity every Monday.'
			},
			{
				key: 'productUpdates',
				title: 'Product updates',
				desc: 'News about features and releases.'
			},
			{ key: 'twoFactor', title: 'Two-factor authentication', desc: 'Require a code at sign-in.' }
		] as const}
		<div class="w-80 rounded-xl border">
			<div class="border-b px-4 py-3">
				<h3 class="text-sm font-semibold">Notifications & security</h3>
				<p class="text-muted-foreground text-xs">Manage how your account behaves.</p>
			</div>
			<div class="divide-y">
				{#each rows as row (row.key)}
					<div class="flex items-center justify-between gap-4 px-4 py-3">
						<div class="flex flex-col">
							<span class="text-sm font-medium">{row.title}</span>
							<span class="text-muted-foreground text-xs">{row.desc}</span>
						</div>
						<SwitchCmp bind:checked={settings[row.key]} />
					</div>
				{/each}
			</div>
			<div class="bg-muted/40 text-muted-foreground rounded-b-xl px-4 py-2 text-xs">
				<code class="font-mono">
					enabled: {Object.entries(settings)
						.filter(([, on]) => on)
						.map(([k]) => k)
						.join(', ') || '—'}
				</code>
			</div>
		</div>
	{/snippet}
</Story>
