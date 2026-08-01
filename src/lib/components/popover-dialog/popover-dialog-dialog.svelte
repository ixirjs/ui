<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { ActivePortal, PortalSurface } from '$ixirjs/ui/components/portal';
	import { mergeAtomProps, type Base } from '$ixirjs/ui/components/atom';
	import { createAtomInstance } from '$ixirjs/ui/shared/bond';
	import { BACKDROP_PRESS } from '$ixirjs/ui/components/overlay';
	import { DialogRootAtom } from '$ixirjs/ui/components/dialog/bond.svelte';
	import { PopoverDialogBond } from './bond.svelte';
	import type { PopoverDialogContentProps } from './types';

	let {
		class: klass = '',
		type = 'modal' as 'modal' | 'non-modal',
		'z-index': zindex = 0,
		portal = undefined,
		children = undefined,
		onclick = undefined,
		...restProps
	}: PopoverDialogContentProps<E, B> = $props();

	const bond = PopoverDialogBond.get();

	const open = $derived(bond?.isOpen ?? false);
	const backdropPress = $derived(bond?.surface(BACKDROP_PRESS));

	// Backdrop = Dialog's modal root atom (the `<dialog>` element). The card itself is
	// the reused `<Dialog.Content>` (DialogBond.get() resolves the fused bond), which
	// carries the dialog content atom + the open/close motion — no duplication here.
	const rootAtom = bond
		? createAtomInstance('root', {
				bond,
				factory: (owner) => new DialogRootAtom(owner!)
			})
		: undefined;
	const rootProps: Record<string, unknown> = $derived(
		mergeAtomProps(rootAtom, undefined, restProps, bond?.presetLayer('root'))
	);

	function onclickRoot(event: MouseEvent) {
		onclick?.(event);
		if (!bond || event.defaultPrevented) return;

		backdropPress?.(bond, event, {
			enabled: type === 'modal',
			onDismiss: (dismissEvent) =>
				bond.stageOpenChange({ event: dismissEvent, reason: 'backdrop-press' })
		});
	}
</script>

<PortalSurface
	owner={bond}
	band="modal"
	as="dialog"
	{portal}
	z-index={zindex}
	class={[
		'pointer-events-none absolute inset-0 flex h-full w-full items-center justify-center bg-neutral-900/0 transition-colors duration-200',
		open && 'pointer-events-auto bg-neutral-900/10',
		'$preset',
		klass
	]}
	onclick={onclickRoot}
	{...rootProps}
>
	<ActivePortal {portal}>
		{#if bond}
			{@render children?.({ popoverDialog: bond })}
		{/if}
	</ActivePortal>
</PortalSurface>
