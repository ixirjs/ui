<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{data.metadata.title}</title>
	<meta name="description" content={data.metadata.description} />
</svelte:head>

<data.Content contentType="html" ex={data.ex} />
