<script lang="ts">
	import { Root } from '$ixirjs/ui/components/root';
	import DialogRoot from '$ixirjs/ui/components/dialog/dialog-root.svelte';
	import DialogClose from '$ixirjs/ui/components/dialog/dialog-close.svelte';
	import { closeDialog } from '$ixirjs/ui/components/dialog/attachments.svelte';
	import type { DialogBond } from '$ixirjs/ui/components/dialog/bond.svelte';
	import type { DialogProps } from '$ixirjs/ui/components/dialog/types';

	let {
		open = true,
		onclick = undefined,
		onopenchange = undefined
	}: Pick<DialogProps, 'open' | 'onclick' | 'onopenchange'> = $props();
	let dialogRoot: { getBond(): DialogBond };

	export function getBond(): DialogBond {
		return dialogRoot.getBond();
	}
</script>

<Root>
	<DialogRoot bind:this={dialogRoot} {open} {onclick} {onopenchange}>
		{#snippet children()}
			<DialogClose data-testid="dialog-close" />
			<button data-testid="dialog-attachment-close" {@attach closeDialog()}>Close</button>
		{/snippet}
	</DialogRoot>
</Root>
