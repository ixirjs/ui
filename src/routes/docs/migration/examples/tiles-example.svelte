<script lang="ts">
	import TilesRoot from './tiles-root.svelte';
	import TilesTrigger from './tiles-trigger.svelte';

	let value = $state('');
	let commits = $state(0);
	let observed = $state('');
</script>

<!-- The callback observes the binding after commit; selecting the same value reports nothing. -->
<TilesRoot
	bind:value
	onvaluechange={() => {
		observed = value;
		commits++;
	}}
>
	{#snippet children({ tiles })}
		<TilesTrigger value="alpha" data-demo="tiles-select">Select alpha</TilesTrigger>
		<code data-demo="tiles-status">{tiles.value || 'none'}:{observed || 'none'}:{commits}</code>
	{/snippet}
</TilesRoot>
