<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { untrack } from 'svelte';
	import { ActivePortal, PortalSurface } from '$ixirjs/ui/components/portal';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { Base, HtmlElementTagName } from '$ixirjs/ui/authoring';
	import { OverlayContext } from '$ixirjs/ui/components/overlay/model.svelte';
	import {
		backdropPress,
		modalRootAttrs,
		surfaceKeydown,
		useModal
	} from '$ixirjs/ui/components/overlay/behavior.svelte';
	import { DialogBond, DialogContext } from './bond.svelte';
	import type { DialogProps } from './types';

	const ID = $props.id();

	let {
		class: klass = '',
		preset = undefined,
		open = $bindable(false),
		disabled = false,
		type = 'modal' as 'modal' | 'non-modal',
		as = 'dialog' as E,
		'z-index': zindex = undefined,
		order = undefined,
		portal = undefined,
		presets = undefined,
		factory = undefined,
		children = undefined,
		onopenchange = undefined,
		onclick = undefined,
		onkeydown = undefined,
		...restProps
	}: DialogProps<E, B> = $props();

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
		get modal() {
			return type === 'modal';
		},
		get presets() {
			return presets;
		}
	};
	// `factory` is read once, at init, by design.
	const build = untrack(() => factory);
	const bond = DialogContext.share(build ? build(bondProps) : DialogBond.create(bondProps));
	// Nested popovers gate their `open` on the nearest overlay host.
	OverlayContext.share(bond);
	// Controlled state: the Bond decides, the root writes, the callback fires after the write with
	// the staged `event`/`reason` a policy left for it.
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
	const rootId = untrack(() => restProps.id as string | undefined) ?? Kernel.id(ID, 'dialog-root');
	bond.attachPart('root', rootId);
	useModal(bond, { root: () => rootElement });
	// Consumer first; preventing default keeps the escape/tab-trap policy from running.
	const surface = surfaceKeydown(bond);
	function keydown(event: KeyboardEvent) {
		onkeydown?.(event as never);
		if (!event.defaultPrevented) surface(event);
	}

	function onclickDialogElement(event: MouseEvent) {
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
	{order}
	{as}
	{portal}
	z-index={zindex}
	preset={preset ?? 'dialog'}
	presetLayer={presets?.root}
	class={[
		'pointer-events-none absolute inset-0 flex h-full w-full items-center justify-center bg-neutral-900/0 transition-colors duration-200',
		open && 'pointer-events-auto bg-neutral-900/10',
		'$preset',
		klass
	]}
	id={rootId}
	{...modalRootAttrs(bond)}
	onclick={onclickDialogElement}
	onkeydown={keydown}
	{...restProps}
>
	<ActivePortal>
		{@render children?.({ dialog: bond })}
	</ActivePortal>
</PortalSurface>
