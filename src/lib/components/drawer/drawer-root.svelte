<script lang="ts" generics="E extends keyof HTMLElementTagNameMap='dialog', B extends Base = Base">
	import type { HTMLAttributes } from 'svelte/elements';
	import Teleport from '$svelte-atoms/core/components/portal/teleport.svelte';
	import type { Base } from '$svelte-atoms/core/components/atom';
	import { DrawerBond } from './bond.svelte';
	import type { SlideoverRootProps } from './types';
	import {
		ActivePortal,
		PortalBond,
		PortalsBond,
		resolvePortal,
		ZLayer,
		type ZIndexInput
	} from '../portal';
	import { animateDrawerRoot } from './motion';
	import { bindBond, useCapabilities } from '$svelte-atoms/core/shared';

	type Element = HTMLElementTagNameMap[E];

	let {
		open = $bindable(false),
		side = 'right',
		children = undefined,
		class: klass = '',
		preset = undefined,
		disabled = false,
		portal = undefined,
		position = 'fixed',
		// +1 in the `modal` band so a Drawer wins over a sibling Dialog (+0).
		'z-index': zindex = 1,
		// swallowed: kept out of restProps (would attach as a native DOM `close` listener). Not yet wired to the close flow.
		onclose: _onclose = undefined,
		factory = (props) => DrawerBond.create(props),
		fallback = {
			animate: animateDrawerRoot({}),
			initial: animateDrawerRoot({ duration: 0 })
		},
		...restProps
		// Omit `children` from HTMLAttributes: it declares `children?: Snippet` (0-arg), which would
		// intersect with SlideoverRootProps' 1-arg `DrawerChildren` into an unsatisfiable type.
	}: SlideoverRootProps<E, B> & Omit<HTMLAttributes<Element>, 'children'> = $props();

	let openState = $derived(open);

	// Resolve the configured portal (id or bond); fall back to the ambient PortalBond when
	// none is configured or the id is unknown.
	const activePortalBond = $derived(resolvePortal(PortalsBond.get(), portal) ?? PortalBond.get());

	const baseLayer = new ZLayer('modal', () => 0);
	// HTMLAttributes<E> intersection narrows 'z-index' to exclude functions in this component;
	// cast inside $derived.by so the read stays reactive and the type is correct.
	const layerOffset = $derived.by(() => {
		const z = zindex as ZIndexInput | undefined;
		if (typeof z === 'function') return z(baseLayer.value) - baseLayer.value;
		return typeof z === 'number' && Number.isFinite(z) ? z : 0;
	});
	const layer = new ZLayer('modal', () => layerOffset).share();

	const binding = bindBond<DrawerBond>(
		(props) => factory(props),
		{
			open: [
				() => openState,
				(v) => {
					openState = v;
					open = openState;
				}
			],
			disabled: () => disabled,
			side: () => side
		},
		{ preset: () => preset }
	);
	const bond = binding.bond.share();

	// Activate the bond's capability setups: the focus capability captures activeElement on
	// open and restores it on close, and the escape capability enrolls this overlay in the
	// topmost-open-overlay stack so only the frontmost surface acts on Escape.
	useCapabilities(bond);

	const rootProps = $derived({
		...binding?.props,
		...restProps
	});

	$effect(() => {
		if (bond.elements.root instanceof HTMLDialogElement) {
			if (openState) {
				bond.elements.root?.show?.();
			}
		}
	});

	export function getBond() {
		return bond;
	}
</script>

<Teleport
	portal={activePortalBond ?? 'root.l0'}
	class={[
		'pointer-events-none inset-0 h-full w-full overflow-hidden bg-transparent',
		!openState && 'pointer-events-none',
		'$preset',
		klass
	]}
	style="position: {position}; z-index: {layer.value};"
	closeby="none"
	{fallback}
	{...rootProps}
>
	<ActivePortal portal={activePortalBond ?? 'root.l0'}>
		{@render children?.({ drawer: bond })}
	</ActivePortal>
</Teleport>
