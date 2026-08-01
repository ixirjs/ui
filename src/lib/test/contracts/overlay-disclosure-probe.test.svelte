<script lang="ts">
	import { Dialog } from '$ixirjs/ui/components/dialog';
	import { Drawer } from '$ixirjs/ui/components/drawer';
	import { Portal } from '$ixirjs/ui/components/portal';
	import { Root } from '$ixirjs/ui/components/root';
	import type { DialogBond } from '$ixirjs/ui/components/dialog/bond.svelte';
	import type { DrawerBond } from '$ixirjs/ui/components/drawer/bond.svelte';

	let {
		kind,
		open = $bindable(false),
		onchange
	}: {
		kind: 'dialog' | 'drawer';
		open?: boolean;
		onchange: (value: boolean, committedValue: boolean | undefined) => void;
	} = $props();

	let dialogRoot = $state<{ getBond(): DialogBond }>();
	let drawerRoot = $state<{ getBond(): DrawerBond }>();

	export function getBond() {
		return kind === 'dialog' ? dialogRoot?.getBond() : drawerRoot?.getBond();
	}
</script>

<Root>
	<Portal.Outer id="contract">
		<Portal.Inner />
	</Portal.Outer>

	{#if kind === 'dialog'}
		<Dialog.Root
			bind:this={dialogRoot}
			bind:open
			portal="contract"
			onopenchange={(value, { bond }) => onchange(value, bond?.isOpen)}
		/>
	{:else}
		<Drawer.Root
			bind:this={drawerRoot}
			bind:open
			portal="contract"
			onopenchange={(value, { bond }) => onchange(value, bond?.isOpen)}
		/>
	{/if}
</Root>
