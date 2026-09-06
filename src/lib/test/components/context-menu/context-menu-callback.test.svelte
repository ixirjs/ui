<script lang="ts">
	import ContextMenuRoot from '$ixirjs/ui/components/context-menu/context-menu-root.svelte';
	import ContextMenuTrigger from '$ixirjs/ui/components/context-menu/context-menu-trigger.svelte';
	import type { ContextMenuBond as ContextMenuBondInstance } from '$ixirjs/ui/components/context-menu/bond.svelte';
	import type { StateChangeCallback } from '$ixirjs/ui/types';

	let {
		onclick = undefined,
		onopenchange = undefined
	}: {
		onclick?: ((event: MouseEvent) => void) | undefined;
		onopenchange?: StateChangeCallback<boolean, ContextMenuBondInstance> | undefined;
	} = $props();
	let open = $state(false);
	let root: ReturnType<typeof ContextMenuRoot>;

	export function getBond(): ContextMenuBondInstance {
		return root.getBond();
	}

	export function getOpen(): boolean {
		return open;
	}

	export function setOpen(value: boolean): void {
		open = value;
	}
</script>

<ContextMenuRoot bind:open bind:this={root} {onopenchange}>
	{#snippet children()}
		<ContextMenuTrigger data-testid="context-menu-trigger" {onclick}>Target</ContextMenuTrigger>
	{/snippet}
</ContextMenuRoot>
