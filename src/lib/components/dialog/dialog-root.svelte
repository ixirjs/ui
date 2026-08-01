<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { Teleport, ActivePortal } from '$svelte-atoms/core/components/portal';
	import type { Base } from '$svelte-atoms/core/components/atom';
	import { mergeAtomProps } from '$svelte-atoms/core/components/atom';
	import { DialogBond, DialogRootAtom, type DialogBondProps } from './bond.svelte';
	import type { DialogProps } from './types';
	import { ZLayer } from '../portal/zlayer.svelte';
	import { bindBond, useCapabilities } from '$svelte-atoms/core/shared';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { BACKDROP_PRESS } from '$svelte-atoms/core/components/portal/host';

	let {
		class: klass = '',
		preset = undefined,
		open = $bindable(false),
		disabled = false,
		type = 'modal' as 'modal' | 'non-modal',
		as = 'dialog' as E,
		// Default +0 within the `modal` band; a sibling Drawer (+1) wins by convention. Override to reorder.
		'z-index': zindex = 0,
		portal = undefined,
		factory = defaultFactory,
		children = undefined,
		onclick = undefined,
		...restProps
	}: DialogProps<E, B> = $props();

	let openState = $derived(open);

	const z = $derived(
		typeof zindex === 'function'
			? zindex(0)
			: typeof zindex === 'number' && Number.isFinite(zindex)
				? zindex
				: 0
	);
	const layer = new ZLayer('modal', () => z);
	new ZLayer('base', () => 0).share();

	const binding = bindBond<DialogBond>(
		(props) => factory(props),
		{
			open: [
				() => openState,
				(v) => {
					openState = v;
					open = openState;
				}
			],
			disabled: () => disabled
		},
		{ preset: () => preset }
	);
	const bond = binding.bond.share();
	const rootAtom = createAtomInstance<DialogRootAtom, DialogBond, HTMLElement>('root', {
		bond,
		factory: (owner) => new DialogRootAtom(owner as DialogBond)
	});

	// Activate the bond's capability setups: the focus capability captures activeElement on
	// open and restores it however the dialog closes, and the escape capability enrolls this
	// overlay in the topmost-open-overlay stack so a nested popover's Escape closes only it.
	useCapabilities(bond);

	const rootProps: Record<string, unknown> = $derived(
		mergeAtomProps(rootAtom, preset, { ...binding.stateProps, ...restProps })
	);
	const backdropPress = $derived(bond.surface(BACKDROP_PRESS));

	function defaultFactory(props: DialogBondProps) {
		return DialogBond.create(props);
	}

	function onclickDialogElement(ev: MouseEvent) {
		backdropPress?.(bond, ev, {
			enabled: type === 'modal',
			onDismiss: (event) => onclick?.(event as MouseEvent, bond)
		});
	}

	export function getBond() {
		return bond;
	}
</script>

<Teleport
	{as}
	portal={portal ?? 'root.l0'}
	class={[
		'pointer-events-none fixed top-0 left-0 flex h-full w-full items-center justify-center bg-neutral-900/0 transition-colors duration-200',
		openState && 'pointer-events-auto bg-neutral-900/10',
		'$preset',
		klass
	]}
	style="z-index: {layer.value};"
	onclick={onclickDialogElement}
	oncancel={(ev) => {
		ev.preventDefault();
		openState = false;
		open = openState;
	}}
	{...rootProps}
>
	<ActivePortal portal={portal ?? 'root.l0'}>
		{@render children?.({ dialog: bond })}
	</ActivePortal>
</Teleport>
