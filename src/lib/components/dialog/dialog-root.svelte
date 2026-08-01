<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { Teleport, ActivePortal } from '$svelte-atoms/core/components/portal';
	import type { Base } from '$svelte-atoms/core/components/atom';
	import { DialogBond, DialogBondState, type DialogBondProps } from './bond.svelte';
	import { useFocusRestore } from '$svelte-atoms/core/shared/overlay';
	import type { DialogProps } from './types';
	import { ZLayer } from '../portal/zlayer.svelte';
	import { bindBond } from '$svelte-atoms/core/shared';

	let {
		class: klass = '',
		preset = undefined,
		open = $bindable(false),
		disabled = false,
		type = 'modal' as 'modal' | 'non-modal',
		as = 'dialog' as E,
		"z-index": zindex = 0,
		portal = undefined,
		factory = defaultFactory,
		children = undefined,
		onclick = undefined,
		...restProps
	}: DialogProps<E, B> = $props();

	const normalizedZIndex = $derived(
		typeof zindex === 'number' && Number.isFinite(zindex) ? zindex : undefined
	);
	const layer = new ZLayer('dialog', () => normalizedZIndex ?? 0).share();

	const binding = bindBond<DialogBond>(
		(props) => factory(props),
		{
			open: [() => open, (v) => (open = v)],
			disabled: () => disabled,
			rest: () => restProps
		},
		{ preset: () => preset }
	);
	const bond = binding.bond.share();

	// Focus capture/restore reacts to `open` (ADR 0001 / ADR 0003) — restores to
	// the previously-focused element however the dialog closes.
	useFocusRestore(bond); 

	const rootProps: Record<string, unknown> = $derived({
		...binding?.props,
		...restProps
	});

	function defaultFactory(props: DialogBondProps) {
		const bondState = new DialogBondState(props);
		return new DialogBond(bondState);
	}

	function onclickDialogElement(ev: MouseEvent) {
		// Ignore clicks that originated inside the dialog content
		if (bond?.elements?.content?.contains(ev.target as Node)) {
			return;
		}

		// Let the user's onclick handler run first; they can call ev.preventDefault() to cancel close
		onclick?.(ev, bond);

		if (ev.defaultPrevented) return;

		// Close on backdrop click unless opted out
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
	style="z-index: {layer.get()};"
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
