<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Chip } from '..';

	const { Story } = defineMeta({
		title: 'Atoms/Chip',
		parameters: { layout: 'centered' }
	});
</script>

<script lang="ts">
	// State for the Dismissible List story — chip set shrinks as each chip is dismissed.
	let tags = $state(['Alpha', 'Beta', 'RC', 'Stable']);

	function remove(tag: string) {
		tags = tags.filter((t) => t !== tag);
	}
</script>

<!-- A chip is dismissible by default: it renders a close button wired to `ondismiss`. -->

<Story name="Basic">
	<Chip ondismiss={() => {}}>Svelte</Chip>
</Story>

<Story name="Filter Chips">
	<!-- Real-world: a filter bar where each chip carries a dismissible label. -->
	<div class="flex flex-wrap items-center gap-2">
		<Chip ondismiss={() => {}}>Svelte</Chip>
		<Chip ondismiss={() => {}}>TypeScript</Chip>
		<Chip ondismiss={() => {}}>Tailwind</Chip>
		<Chip ondismiss={() => {}}>Vite</Chip>
		<Chip ondismiss={() => {}}>Storybook</Chip>
	</div>
</Story>

<Story name="Dismissible List">
	<!-- Live readout so the reader sees the active set change as chips are dismissed. -->
	<div class="flex flex-col items-start gap-3">
		<div class="flex flex-wrap items-center gap-2">
			{#each tags as tag (tag)}
				<Chip ondismiss={() => remove(tag)}>{tag}</Chip>
			{/each}
		</div>
		<code class="text-muted-foreground font-mono text-xs">active = {tags.join(', ') || '—'}</code>
	</div>
</Story>
