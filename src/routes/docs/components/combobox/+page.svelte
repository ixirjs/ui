<script lang="ts">
	import { metadata } from './shared';
	import Content from './content.svelte';
</script>

<svelte:head>
	<title>{metadata.title}</title>
	<meta name="description" content={metadata.description} />
</svelte:head>

<Content contentType="html" />
