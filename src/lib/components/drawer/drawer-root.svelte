<script lang="ts" generics="E extends HtmlElementTagName='dialog', B extends Base = Base">
	import { untrack } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { ActivePortal, PortalSurface } from '$ixirjs/ui/components/portal';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { Base, HtmlElementTagName } from '$ixirjs/ui/authoring';
	import { OverlayContext } from '$ixirjs/ui/components/overlay/model.svelte';
	import {
		modalRootAttrs,
		surfaceKeydown,
		useModal
	} from '$ixirjs/ui/components/overlay/behavior.svelte';
	import { DrawerBond, DrawerContext } from './bond.svelte';
	import type { SlideoverRootProps } from './types';
	import { animateDrawerRoot } from './motion.svelte';

	type Element = HTMLElementTagNameMap[E];

	const ID = $props.id();

	let {
		open = $bindable(false),
		side = 'right',
		children = undefined,
		class: klass = '',
		preset = undefined,
		disabled = false,
		portal = undefined,
		presets = undefined,
		position = 'fixed',
		'z-index': zindex = undefined,
		order = undefined,
		onopenchange = undefined,
		onkeydown = undefined,
		// Swallow Kernel's internal defaults layer; it is not a Drawer.Root override.
		defaults: _defaults = undefined,
		// swallowed: old fallback prop is removed; keep it off the DOM spread.
		fallback: _fallback = undefined,
		factory = undefined,
		...restProps
		// Omit `children` from HTMLAttributes: it declares `children?: Snippet` (0-arg), which would
		// intersect with SlideoverRootProps' 1-arg `DrawerChildren` into an unsatisfiable type.
	}: SlideoverRootProps<E, B> & Omit<HTMLAttributes<Element>, 'children'> = $props();

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
		get side() {
			return side;
		},
		get presets() {
			return presets;
		}
	};
	// `factory` is read once, at init, by design.
	const build = untrack(() => factory);
	const bond = DrawerContext.share(build ? build(bondProps) : DrawerBond.create(bondProps));
	// Nested popovers gate their `open` on the nearest overlay host.
	OverlayContext.share(bond);
	bond.bindCommit((next, context) => {
		open = next;
		onopenchange?.(next, context);
	});
	export const getBond = () => bond;

	// The surface element, captured reactively: the modal effects (inert siblings) need it, and the
	// portal surface renders it only once its sink has resolved — after this root's first effect.
	let rootElement = $state<HTMLElement>();
	function captureRoot(node: HTMLElement) {
		rootElement = node;
		return () => {
			if (rootElement === node) rootElement = undefined;
		};
	}
	const rootId = untrack(() => restProps.id as string | undefined) ?? Kernel.id(ID, 'drawer-root');
	bond.attachPart('root', rootId);
	useModal(bond, { root: () => rootElement });
	// Consumer first; preventing default keeps the escape/tab-trap policy from running.
	const surface = surfaceKeydown(bond);
	function keydown(event: KeyboardEvent) {
		onkeydown?.(event as never);
		if (!event.defaultPrevented) surface(event);
	}

	const defaults = {
		animate: animateDrawerRoot({}),
		initial: animateDrawerRoot({ duration: 0 })
	};

	// The modal projection plus the drawer's own open/active facts, read where the surface renders.
	const rootAttrs = $derived.by(() => {
		const isActive = bond.isOpen && !bond.isDisabled;
		return { ...modalRootAttrs(bond), 'aria-hidden': !isActive, 'data-active': isActive };
	});
</script>

<!-- Handed to `PortalSurface` — another component — so the modal projection is passed literally. -->
<PortalSurface
	{@attach captureRoot}
	owner={bond}
	band="modal"
	{order}
	{portal}
	z-index={zindex}
	preset={preset ?? 'drawer'}
	presetLayer={presets?.root}
	class={[
		'pointer-events-none inset-0 h-full w-full overflow-hidden bg-transparent',
		!open && 'pointer-events-none',
		'$preset',
		klass
	]}
	style="position: {position};"
	closeby="none"
	{defaults}
	id={rootId}
	{...rootAttrs}
	onkeydown={keydown}
	{...restProps}
>
	<ActivePortal>
		{@render children?.({ drawer: bond })}
	</ActivePortal>
</PortalSurface>
