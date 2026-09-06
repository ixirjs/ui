<script lang="ts" generics="E extends HtmlElementTagName = 'dialog', B extends Base = Base">
	import { PopupBond } from '$ixirjs/ui/components/overlay/popup/bond.svelte';
	import type { Base, HtmlElementTagName } from '$ixirjs/ui/authoring';
	import { OverlayContext } from '$ixirjs/ui/components/overlay/model.svelte';
	import {
		PopoverContext,
		type PopoverBond as MigratedPopoverBond
	} from '$ixirjs/ui/components/popover/bond.svelte';
	import { DialogContext, type DialogBond } from '$ixirjs/ui/components/dialog/bond.svelte';
	import { PopoverDialogContext } from './bond.svelte';
	import type { PopoverDialogRootProps } from './types';

	const ID = $props.id();

	let {
		open = $bindable(false),
		disabled = false,
		presets = undefined,
		onopenchange = undefined,
		children = undefined
	}: PopoverDialogRootProps<E, B> = $props();

	// Live props: the Bond reads through these getters, so a prop change is seen where it is read.
	const bondProps = {
		get id() {
			return ID;
		},
		get open() {
			return open;
		},
		set open(value: boolean | undefined) {
			open = value ?? false;
		},
		get disabled() {
			return disabled;
		},
		get presets() {
			return presets;
		}
	};

	// Root owns state + context only: the trigger renders in flow (`<PopoverDialog.Trigger>`) and the
	// modal self-portals from `<PopoverDialog.Dialog>`.
	const bond = PopoverDialogContext.share(PopupBond.mount('popover-dialog', bondProps));
	// The fused bond answers to both halves' keys, which is what makes `<PopoverDialog.Trigger>` the
	// real `<Popover.Trigger>` and `<PopoverDialog.Content>` the real `<Dialog.Content>`. Each cast is
	// retained nominal context types, not runtime inheritance: both halves read the shared overlay contract.
	DialogContext.share(bond as unknown as DialogBond);
	PopoverContext.share(bond as unknown as MigratedPopoverBond);
	// Nested popovers gate their `open` on the nearest overlay host.
	OverlayContext.share(bond);

	// Controlled state: the Bond decides, the root writes, the callback fires after the write with
	// the staged `event`/`reason` a policy left for it.
	bond.bindCommit((next, context) => {
		open = next;
		onopenchange?.(next, context);
	});

	export const getBond = () => bond;
</script>

{@render children?.({ popoverDialog: bond })}
