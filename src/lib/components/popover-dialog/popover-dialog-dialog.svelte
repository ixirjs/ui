<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { untrack } from 'svelte';
	import { ActivePortal, PortalSurface } from '$ixirjs/ui/components/portal';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { Base, BasePropsOf, HtmlElementTagName } from '$ixirjs/ui/authoring';
	import {
		backdropPress,
		modalRootAttrs,
		surfaceKeydown,
		useModal
	} from '$ixirjs/ui/components/overlay/behavior.svelte';
	import { PopoverDialogContext } from './bond.svelte';
	import type { PopoverDialogContentProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		type = 'modal' as 'modal' | 'non-modal',
		'z-index': zindex = 0,
		portal = undefined,
		children = undefined,
		onclick = undefined,
		onkeydown = undefined,
		...restProps
	}: PopoverDialogContentProps<E, B> & BasePropsOf<B> = $props();

	const bond = PopoverDialogContext.getOrThrow(
		'<PopoverDialog.Dialog /> must be used within a <PopoverDialog.Root />'
	);

	// The surface element, captured reactively: the modal effects (inert siblings) need it, and the
	// portal surface renders it only once its sink has resolved — after this component's first effect.
	let rootElement = $state<HTMLElement>();
	function captureRoot(node: HTMLElement) {
		rootElement = node;
		return () => {
			if (rootElement === node) rootElement = undefined;
		};
	}
	const rootId =
		untrack(() => restProps.id as string | undefined) ?? Kernel.id(bond.id, `${bond.name}-root`);
	bond.attachPart('root', rootId);
	useModal(bond, { root: () => rootElement });

	// Consumer first; preventing default keeps the escape/tab-trap policy from running.
	const surface = surfaceKeydown(bond);
	function keydown(event: KeyboardEvent) {
		onkeydown?.(event as never);
		if (!event.defaultPrevented) surface(event);
	}

	function onclickRoot(event: MouseEvent) {
		onclick?.(event);
		if (event.defaultPrevented) return;
		backdropPress(bond, event, { enabled: type === 'modal' });
	}
</script>

<!-- Handed to `PortalSurface` — another component — so the modal projection is passed literally. -->
<PortalSurface
	{@attach captureRoot}
	owner={bond}
	band="modal"
	as="dialog"
	{portal}
	z-index={zindex}
	preset={preset ?? 'popover-dialog'}
	presetLayer={bond.props.presets?.root}
	class={[
		'pointer-events-none absolute inset-0 flex h-full w-full items-center justify-center bg-neutral-900/0 transition-colors duration-200',
		bond.isOpen && 'pointer-events-auto bg-neutral-900/10',
		'$preset',
		klass
	]}
	id={rootId}
	{...modalRootAttrs(bond)}
	onclick={onclickRoot}
	onkeydown={keydown}
	{...restProps}
>
	<ActivePortal {portal}>
		{@render children?.({ popoverDialog: bond })}
	</ActivePortal>
</PortalSurface>
