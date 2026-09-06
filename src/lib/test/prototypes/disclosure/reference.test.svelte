<script lang="ts">
	import Root from '$ixirjs/ui/components/collapsible/collapsible-root.svelte';
	import Header from '$ixirjs/ui/components/collapsible/collapsible-header.svelte';
	import Body from '$ixirjs/ui/components/collapsible/collapsible-body.svelte';
	import type { CollapsibleBond } from '$ixirjs/ui/components/collapsible/bond.svelte';
	import type { StateChangeCallback } from '$ixirjs/ui/types';

	let {
		open = $bindable(false),
		disabled = false,
		onclick = undefined,
		onopenchange = undefined
	}: {
		open?: boolean;
		disabled?: boolean;
		onclick?: ((event: MouseEvent) => void) | undefined;
		onopenchange?: StateChangeCallback<boolean, CollapsibleBond>;
	} = $props();
	let root: { getBond(): CollapsibleBond } | undefined = $state();
	export const getBond = () => root!.getBond();
</script>

<Root bind:this={root} bind:open {disabled} {...onopenchange ? { onopenchange } : {}}>
	<Header {...onclick ? { onclick } : {}}>Toggle</Header>
	<Body>Body</Body>
</Root>
