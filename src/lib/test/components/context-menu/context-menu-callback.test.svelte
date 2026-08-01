<script lang="ts">
	import ContextMenuRoot from '$ixirjs/ui/components/context-menu/context-menu-root.svelte';
	import ContextMenuTrigger from '$ixirjs/ui/components/context-menu/context-menu-trigger.svelte';
	import {
		ContextMenuBond,
		type ContextMenuBond as ContextMenuBondInstance,
		type ContextMenuBondProps
	} from '$ixirjs/ui/components/context-menu/bond.svelte';
	import type { StateChangeCallback } from '$ixirjs/ui/types';

	let {
		onclick = undefined,
		onopenchange = undefined
	}: {
		onclick?: ((event: MouseEvent) => void) | undefined;
		onopenchange?: StateChangeCallback<boolean, ContextMenuBondInstance> | undefined;
	} = $props();
	let open = $state(false);
	let bond: ContextMenuBondInstance | undefined;

	function factory(props: ContextMenuBondProps): ContextMenuBondInstance {
		bond = ContextMenuBond.create(props);
		return bond;
	}

	export function getBond(): ContextMenuBondInstance {
		return bond!;
	}

	export function getOpen(): boolean {
		return open;
	}

	export function setOpen(value: boolean): void {
		open = value;
	}
</script>

<ContextMenuRoot bind:open {factory} {onopenchange}>
	{#snippet children()}
		<ContextMenuTrigger data-testid="context-menu-trigger" {onclick}>Target</ContextMenuTrigger>
	{/snippet}
</ContextMenuRoot>
