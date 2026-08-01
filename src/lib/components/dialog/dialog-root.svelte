<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { Teleport, ActivePortal } from '$svelte-atoms/core/components/portal';
	import { containsTarget } from '$svelte-atoms/core/utils/dom.svelte';
	import type { Base } from '$svelte-atoms/core/components/atom';
	import { DialogBond, DialogBondState } from './bond.svelte';
	import type { DialogProps } from './types';
	import { ZLayer } from '../portal/zlayer.svelte';
	import { bindBond, bondFactory, useCapabilities } from '$svelte-atoms/core/shared';

	let {
		class: klass = '',
		preset = undefined,
		open = $bindable(false),
		disabled = false,
		type = 'modal' as 'modal' | 'non-modal',
		as = 'dialog' as E,
		// Default +0 within the `modal` band; a sibling Drawer (+1) wins by convention (ADR 0009 D5). Override to reorder.
		"z-index": zindex = 0,
		portal = undefined,
		factory = bondFactory(DialogBondState, DialogBond),
		children = undefined,
		onclick = undefined,
		...restProps
	}: DialogProps<E, B> = $props();

	const normalizedZIndex = $derived(
		typeof zindex === 'number' && Number.isFinite(zindex) ? zindex : undefined
	);
	const layer = new ZLayer('modal', () => normalizedZIndex ?? 0).share();

	const binding = bindBond<DialogBond>(
		(props) => factory(props),
		{
			open: [() => open, (v) => (open = v)],
			disabled: () => disabled
		},
		{ preset: () => preset }
	);
	const bond = binding.bond.share();

	// Run capability setups — focus capture/restore (ADR 0001 / ADR 0003) is owned by the focus
	// capability's setup() and applies however the dialog closes (#5, ADR 0010).
	useCapabilities(bond);
	// Topmost-open-overlay Escape coordination (ADR 0009 D1/D2): a nested popover's Escape closes only it.

	const rootProps: Record<string, unknown> = $derived({
		...binding?.props,
		...restProps
	});

	function onclickDialogElement(ev: MouseEvent) {
		if (containsTarget(bond?.elements?.content, ev.target)) {
			return;
		}

		// User handler runs first; ev.preventDefault() cancels the close
		onclick?.(ev, bond);

		if (ev.defaultPrevented) return;

		if (type === 'modal' && !disabled) {
			bond.state.close();
		}
	}

	export function getBond() {
		return bond;
	}
</script>


<Teleport
	{as}
	portal={portal ?? 'root.l0'}
	class={[
		'border-border pointer-events-none fixed top-0 left-0 flex h-full w-full items-center justify-center bg-neutral-900/0 transition-colors duration-200',
		open && 'pointer-events-auto bg-neutral-900/10',
		'$preset',
		klass
	]}
	style="z-index: {layer.value};"
	onclick={onclickDialogElement}
	oncancel={(ev) => {
		ev.preventDefault();
		open = false;
	}}
	{...rootProps}
>
	<ActivePortal portal={portal ?? 'root.l0'}>
		{@render children?.({ dialog: bond })}
	</ActivePortal>
</Teleport>
