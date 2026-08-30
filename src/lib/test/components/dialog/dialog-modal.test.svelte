<script lang="ts">
	import { Root } from '$ixirjs/ui/components/root';
	import { Dialog } from '$ixirjs/ui/components/dialog';
	import type { DialogBond } from '$ixirjs/ui/components/dialog/bond.svelte';
	import type { DialogProps } from '$ixirjs/ui/components/dialog/types';

	let {
		open = $bindable(true),
		type = 'modal',
		onkeydown = undefined
	}: Pick<DialogProps, 'type' | 'onkeydown'> & { open?: boolean } = $props();
	let dialogRoot: { getBond(): DialogBond };

	export function getBond(): DialogBond {
		return dialogRoot.getBond();
	}
</script>

<Root>
	<button data-testid="outside">outside</button>
	<Dialog.Root bind:this={dialogRoot} bind:open {type} {onkeydown} data-testid="dialog-root">
		<Dialog.Content>
			<Dialog.Title>Title</Dialog.Title>
			<Dialog.Description>Description</Dialog.Description>
			<button data-testid="inside">inside</button>
		</Dialog.Content>
	</Dialog.Root>
</Root>
