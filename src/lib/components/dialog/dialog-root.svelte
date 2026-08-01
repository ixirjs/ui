<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { ActivePortal, PortalSurface } from '$ixirjs/ui/components/portal';
	import type { Base } from '$ixirjs/ui/components/atom';
	import { mergeAtomProps } from '$ixirjs/ui/components/atom';
	import { DialogBond, type DialogBondProps } from './bond.svelte';
	import type { DialogProps } from './types';
	import { controlledProp, useRoot } from '$ixirjs/ui/shared';
	import { BACKDROP_PRESS } from '$ixirjs/ui/components/overlay';

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
		factory = defaultFactory,
		children = undefined,
		onopenchange = undefined,
		onclick = undefined,
		...restProps
	}: DialogProps<E, B> = $props();

	const openProp = controlledProp<boolean, DialogBond>({
		get: () => open,
		set: (value) => (open = value),
		onchange: (value, context) => onopenchange?.(value, context),
		context: (bond) => bond.takeOpenChangeContext()
	});

	const root = useRoot(
		DialogBond,
		{
			open: openProp,
			disabled: () => disabled,
			modal: () => type === 'modal',
			presets: () => presets
		},
		{
			preset: () => preset,
			id: () => ID,
			factory: (props) => factory(props)
		}
	);
	const bond = root.bond;

	// The merged packet, not the direct seam: these props are handed to `PortalSurface`, which is
	// another component and has no renderer seam to forward a part through.
	const rootProps: Record<string, unknown> = $derived(
		mergeAtomProps(root.atom, preset, { ...root.props, ...restProps }, root.presetLayer)
	);
	const backdropPress = $derived(bond.surface(BACKDROP_PRESS));

	function defaultFactory(props: DialogBondProps) {
		return DialogBond.create(props);
	}

	function onclickDialogElement(event: MouseEvent) {
		onclick?.(event);
		if (event.defaultPrevented) return;

		backdropPress?.(bond, event, {
			enabled: type === 'modal',
			onDismiss: (dismissEvent) =>
				bond.stageOpenChange({ event: dismissEvent, reason: 'backdrop-press' })
		});
	}

	export function getBond() {
		return bond;
	}
</script>

<PortalSurface
	owner={bond}
	band="modal"
	{order}
	{as}
	{portal}
	z-index={zindex}
	class={[
		'pointer-events-none absolute inset-0 flex h-full w-full items-center justify-center bg-neutral-900/0 transition-colors duration-200',
		openProp.value && 'pointer-events-auto bg-neutral-900/10',
		'$preset',
		klass
	]}
	onclick={onclickDialogElement}
	{...rootProps}
>
	<ActivePortal>
		{@render children?.({ dialog: bond })}
	</ActivePortal>
</PortalSurface>
