<script lang="ts">
	import { untrack } from 'svelte';
	import { Root } from '$ixirjs/ui/components/root';
	import { Popover } from '$ixirjs/ui/components/popover';
	import { Tooltip } from '$ixirjs/ui/components/tooltip';
	import DialogRoot from '$ixirjs/ui/components/popover-dialog/popover-dialog-root.svelte';
	import { PopoverDialog } from '$ixirjs/ui/components/popover-dialog';

	let {
		kind = 'nested',
		cancel = false
	}: {
		kind?: 'nested' | 'tooltip' | 'dialog';
		cancel?: boolean;
	} = $props();
	let outerOpen = $state(untrack(() => kind !== 'tooltip'));
	let innerOpen = $state(true);
	let reasons = $state<string[]>([]);
	function keydown(event: KeyboardEvent) {
		if (cancel) event.preventDefault();
	}
</script>

<Root>
	<button data-testid="outside">Outside</button>
	{@render (kind === 'tooltip' ? tooltip : kind === 'dialog' ? dialog : nested)()}
	<output data-testid="overlay-state">{JSON.stringify({ outerOpen, innerOpen, reasons })}</output>
</Root>

{#snippet tooltip()}
	<Tooltip.Root
		bind:open={outerOpen}
		onopenchange={(_, context) => reasons.push(context.reason ?? '')}
	>
		<Tooltip.Trigger data-testid="hover-trigger">Hover</Tooltip.Trigger>
		<Tooltip.Content data-testid="tooltip">Help</Tooltip.Content>
	</Tooltip.Root>
{/snippet}

{#snippet dialog()}
	<DialogRoot bind:open={outerOpen}>
		<PopoverDialog.Trigger data-testid="dialog-trigger">Open dialog</PopoverDialog.Trigger>
		<PopoverDialog.Dialog>
			<PopoverDialog.Content
				><button data-testid="modal-button">Inside</button></PopoverDialog.Content
			>
		</PopoverDialog.Dialog>
	</DialogRoot>
{/snippet}

{#snippet nested()}
	<Popover.Root bind:open={outerOpen}>
		<Popover.Trigger data-testid="outer-trigger">Outer</Popover.Trigger>
		<Popover.Content data-testid="outer" onkeydown={keydown}>
			<Popover.Root bind:open={innerOpen}>
				<Popover.Trigger data-testid="inner-trigger">Inner</Popover.Trigger>
				<Popover.Content data-testid="inner" onkeydown={keydown}>Nested</Popover.Content>
			</Popover.Root>
		</Popover.Content>
	</Popover.Root>
{/snippet}
