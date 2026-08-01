<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Lazy from '../lazy.svelte';

	const { Story } = defineMeta({
		title: 'Atoms/Lazy',
		parameters: { layout: 'centered' }
	});
</script>

<script lang="ts">
	import { delay } from 'es-toolkit';
</script>

<!-- Primary story: simulates a 2-second async load of a Button component -->
<Story name="Basic">
	{#snippet template()}
		<Lazy
			promise={import('../../button/button.svelte').then(async (res) => {
				await delay(1000 * 2);
				return res.default;
			})}
		>
			Click me

			{#snippet loading()}
				<span class="text-sm text-muted-foreground">Loading component…</span>
			{/snippet}

			{#snippet error(err)}
				<span class="text-sm text-destructive">Failed to load: {String(err)}</span>
			{/snippet}
		</Lazy>
	{/snippet}
</Story>

<!-- Instant load: no perceptible delay, loading state skipped -->
<Story name="Instant Load">
	<Lazy promise={import('../../button/button.svelte').then((res) => res.default)}>
		Loaded instantly

		{#snippet loading()}
			<span class="text-sm text-muted-foreground">Loading…</span>
		{/snippet}
	</Lazy>
</Story>

<!-- Error state: the promise rejects so the error snippet is rendered -->
<Story name="Error State">
	<Lazy
		promise={new Promise((_, reject) => {
			setTimeout(() => reject(new Error('Network timeout')), 1500);
		})}
	>
		{#snippet loading()}
			<span class="text-sm text-muted-foreground">Loading component…</span>
		{/snippet}

		{#snippet error(err)}
			<span class="text-sm text-destructive">Error: {String(err)}</span>
		{/snippet}
	</Lazy>
</Story>

<!-- Loading skeleton: shows a placeholder while waiting -->
<Story name="Loading Skeleton">
	<Lazy
		promise={import('../../button/button.svelte').then(async (res) => {
			await delay(1000 * 5);
			return res.default;
		})}
	>
		Lazy content

		{#snippet loading()}
			<div class="flex flex-col gap-2 w-64">
				<div class="h-4 w-full rounded bg-muted animate-pulse"></div>
				<div class="h-4 w-4/5 rounded bg-muted animate-pulse"></div>
				<div class="h-8 w-24 rounded bg-muted animate-pulse"></div>
			</div>
		{/snippet}
	</Lazy>
</Story>
