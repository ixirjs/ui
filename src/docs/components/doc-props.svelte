<script lang="ts">
	import { getDocMode } from '$docs/context/doc-mode.svelte';
	import Props from '$docs/props-datagrid.svelte';
	import { PropsTable } from '$docs/md/components';

	let {
		data
	}: {
		data: { name: string; type: string; default: string; description: string }[];
	} = $props();

	const mode = getDocMode();
</script>

{#if mode === 'html'}
	<Props {data} />
{:else}
	<PropsTable props={data} />
{/if}
