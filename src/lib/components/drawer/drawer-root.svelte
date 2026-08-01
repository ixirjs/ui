<script lang="ts" generics="E extends keyof HTMLElementTagNameMap='dialog', B extends Base = Base">
	import type { HTMLAttributes } from 'svelte/elements';
	import Teleport from '$svelte-atoms/core/components/portal/teleport.svelte';
	import type { Base } from '$svelte-atoms/core/components/atom';
	import { DrawerBond, DrawerBondState } from './bond.svelte';
	import type { SlideoverRootProps } from './types';
	import { ActivePortal, ZLayer } from '../portal';
	import { animateDrawerRoot } from './motion';
	import { bondFactory,bindBond, useCapabilities } from '$svelte-atoms/core/shared';

	type Element = HTMLElementTagNameMap[E];

	let {
		open = $bindable(false),
		side = 'right',
		children = undefined,
		class: klass = '',
		preset = undefined,
		disabled = false,
		portal = undefined,
		// +1 in the `modal` band so a Drawer wins over a sibling Dialog (+0); LAYER_BASE, ADR 0009 D5.
		"z-index": zindex = 1,
		onclose = undefined,
		factory = bondFactory(DrawerBondState, DrawerBond),
		fallback = {
			animate: animateDrawerRoot({}),
			initial: animateDrawerRoot({ duration: 0 }),
		},
		...restProps
	}: SlideoverRootProps<E, B> & HTMLAttributes<Element> = $props();

	const normalizedZIndex = $derived(
		typeof zindex === 'number' && Number.isFinite(zindex) ? zindex : undefined
	);
	const layer = new ZLayer('modal', () => normalizedZIndex ?? 0).share();

	const binding = bindBond<DrawerBond>(
		(props) => factory(props),
		{
			open: [() => open, (v) => (open = v)],
			disabled: () => disabled,
			side: () => side
		}
	);
	const bond = binding.bond.share();
	
	// Run capability setups — focus capture/restore reacts to `open` via the focus capability's
	// setup() (ADR 0001 / ADR 0003, #5, ADR 0010).
	useCapabilities(bond);
	// Topmost-open-overlay Escape coordination (ADR 0009 D1/D2).

	const rootProps = $derived({
		...binding?.props,
		...restProps
	});

	$effect(() => {
		if (bond.elements.root instanceof HTMLDialogElement) {
			if (open) {
				bond.elements.root?.show?.();
			}
		}
	});


	export function getBond() {
		return bond;
	}
</script>

<Teleport
	portal={portal ?? 'root.l0'}
	class={[
		'pointer-events-none fixed inset-0 h-full w-full overflow-hidden bg-transparent',
		!open && 'pointer-events-none',
		'$preset',
		klass
	]}
	style="z-index: {layer.value};"
	closeby="none"
	{fallback}
	{...rootProps}
>
	<ActivePortal portal={portal ?? 'root.l0'}>
		{@render children?.({ drawer: bond })}
	</ActivePortal>
</Teleport>
