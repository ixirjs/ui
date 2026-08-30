<script lang="ts">
	import Root from './wb-card-root.test.svelte';
	import Header from './wb-card-header.test.svelte';
	import Title from './wb-card-title.test.svelte';
	import Body from './wb-card-body.test.svelte';
	import Renderer from '$ixirjs/ui/test/components/atom/custom-renderer.test.svelte';
	let {
		as = undefined,
		custom = false,
		onclick = undefined
	}: { as?: string; custom?: boolean; onclick?: (event: MouseEvent) => void } = $props();
</script>

<Root data-testid="root" {...onclick ? { onclick } : {}}>
	<Header>
		<Title data-testid="title" {...as ? { as } : {}} {...custom ? { base: Renderer } : {}}
			>Title</Title
		>
	</Header>
	<Body>Body</Body>
</Root>
