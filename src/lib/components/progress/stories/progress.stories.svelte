<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { ProgressLinear, ProgressCircular } from '..';

	const { Story } = defineMeta({
		title: 'Atoms/Progress',
		parameters: { layout: 'centered' },
		args: {
			value: 60,
			max: 100
		},
		argTypes: {
			value: {
				control: 'number',
				description: 'Current progress value (0–max). Set to null for indeterminate state.'
			},
			max: {
				control: 'number',
				description: 'Maximum value (default: 100)'
			}
		}
	});
</script>

<script lang="ts">
	let value = $state(0);
	let running = $state(false);

	$effect(() => {
		if (!running) return;
		const id = setInterval(() => {
			value = Math.min(100, value + 4);
			if (value >= 100) running = false;
		}, 120);
		return () => clearInterval(id);
	});

	function start() {
		if (value >= 100) value = 0;
		running = true;
	}

	function reset() {
		running = false;
		value = 0;
	}
</script>

<!--
	Interactive: drive the `value` prop from local state. Progress is a pure
	presentation atom — it renders whatever number you bind to `value`.
-->
<Story name="Live Upload">
	<div class="flex w-80 flex-col gap-4">
		<div class="flex items-center justify-between text-xs font-medium">
			<span>{value >= 100 ? 'Upload complete' : running ? 'Uploading…' : 'Ready'}</span>
			<span class="text-foreground/60 tabular-nums">{value}%</span>
		</div>
		<ProgressLinear {value} />
		<div class="flex gap-2">
			<button
				class="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
				onclick={start}
				disabled={running}
			>
				{value >= 100 ? 'Restart' : 'Start'}
			</button>
			<button
				class="border-border hover:bg-muted rounded-md border px-3 py-1.5 text-sm font-medium transition-colors"
				onclick={reset}
			>
				Reset
			</button>
		</div>
		<code class="bg-muted/50 text-muted-foreground rounded-md border px-3 py-2 text-xs font-mono">
			&lt;ProgressLinear value=&#123;{value}&#125; /&gt;
		</code>
	</div>
</Story>

<!-- Basic: the plainest usable progress bar, driven by the `value`/`max` args. -->
<Story name="Basic">
	{#snippet template(args)}
		<div class="flex w-72 flex-col gap-4">
			<ProgressLinear {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Linear — States">
	<div class="flex w-72 flex-col gap-4">
		<ProgressLinear value={25} />
		<ProgressLinear value={50} />
		<ProgressLinear value={75} />
		<ProgressLinear value={100} />
		<ProgressLinear value={null} />
		<!-- indeterminate -->
	</div>
</Story>

<Story name="Circular">
	{#snippet template(args)}
		<div class="flex gap-6">
			<ProgressCircular {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Circular — States">
	<div class="flex gap-6">
		<ProgressCircular value={25} />
		<ProgressCircular value={50} />
		<ProgressCircular value={75} />
		<ProgressCircular value={100} />
		<ProgressCircular value={null} />
		<!-- indeterminate -->
	</div>
</Story>

<Story name="With Label">
	<div class="flex w-72 flex-col gap-1">
		<div class="flex items-center justify-between text-xs font-medium">
			<span>Uploading…</span>
			<span class="text-foreground/60">80%</span>
		</div>
		<ProgressLinear value={80} />
	</div>
</Story>

<Story name="Indeterminate">
	<div class="flex w-72 flex-col items-center gap-6">
		<ProgressLinear value={null} />
		<ProgressCircular value={null} />
	</div>
</Story>
