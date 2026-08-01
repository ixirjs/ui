<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { Teleport, ActivePortal } from '$svelte-atoms/core/components/portal';
	import { containsTarget } from '$svelte-atoms/core/utils/dom.svelte';
	import { type Base } from '$svelte-atoms/core/components/atom';
	import { ZLayer } from '../portal/zlayer.svelte';
	import { Content as DialogContent } from '../dialog/atoms';
	import { PopoverDialogBond } from './bond.svelte';
	import type { PopoverDialogContentProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		type = 'modal' as 'modal' | 'non-modal',
		'z-index': zindex = 0,
		portal = undefined,
		children = undefined,
		onclick = undefined,
		...restProps
	}: PopoverDialogContentProps<E, B> = $props();

	const bond = PopoverDialogBond.get();

	const baseLayer = new ZLayer('modal', () => 0);
	const layerOffset = $derived(
		typeof zindex === 'function'
			? zindex(baseLayer.value) - baseLayer.value
			: typeof zindex === 'number' && Number.isFinite(zindex)
				? zindex
				: 0
	);
	const layer = new ZLayer('modal', () => layerOffset).share();

	const open = $derived(bond?.isOpen ?? false);
	const disabled = $derived(
		(bond?.state.props as { disabled?: boolean } | undefined)?.disabled ?? false
	);

	// Backdrop = Dialog's modal root atom (the `<dialog>` element). The card itself is
	// the reused `<Dialog.Content>` (DialogBond.get() resolves the fused bond), which
	// carries the dialog content atom + the open/close motion — no duplication here.
	// The fused bond's `root()` return type widens to `never` through the fusion seam; cast to the
	// atom's read shape (preset + spread) so the presentation merge below type-checks.
	const rootAtom = $derived(
		bond?.root?.() as { preset?: unknown; spread?: Record<string, unknown> } | undefined
	);
	const rootProps: Record<string, unknown> = $derived({
		preset: rootAtom?.preset,
		...rootAtom?.spread
	});

	function onclickRoot(ev: MouseEvent) {
		if (!bond) return;
		// Ignore clicks that originated inside the card.
		if (containsTarget(bond.elements?.content, ev.target)) return;
		onclick?.(ev, bond);
		if (ev.defaultPrevented) return;
		if (type === 'modal' && !disabled) bond.close?.();
	}
</script>

<Teleport
	as="dialog"
	{bond}
	portal={portal ?? 'root.l0'}
	class={[
		'pointer-events-none fixed top-0 left-0 flex h-full w-full items-center justify-center bg-neutral-900/0 transition-colors duration-200',
		open && 'pointer-events-auto bg-neutral-900/10'
	]}
	style="z-index: {layer.value};"
	onclick={onclickRoot}
	oncancel={(ev) => {
		ev.preventDefault();
		bond?.close?.();
	}}
	{...rootProps}
>
	<ActivePortal portal={portal ?? 'root.l0'}>
		<DialogContent class={klass} {preset} {...restProps}>
			{#if bond}
				{@render children?.({ popoverDialog: bond })}
			{/if}
		</DialogContent>
	</ActivePortal>
</Teleport>
