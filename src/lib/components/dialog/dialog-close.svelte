<script
	lang="ts"
	generics="E extends keyof HTMLElementTagNameMap = 'button', B extends Base = Base"
>
	import { Icon } from '$svelte-atoms/core/components/icon';
	import Close from '$svelte-atoms/core/icons/icon-close.svelte';
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { DialogBond, DialogCloseAtom } from './bond.svelte';
	import type { DialogCloseButtonProps } from './types';

	const bond = DialogBond.getOrThrow('<Dialog.Close /> must be used within a <Dialog.Root />');

	let {
		class: klass = '',
		preset = undefined,
		as = 'button' as E,
		children = undefined,
		onclick = undefined,
		...restProps
	}: DialogCloseButtonProps<E, B> = $props();

	const atom = createAtomInstance<DialogCloseAtom, DialogBond, HTMLElement>('close', {
		bond,
		factory: (owner) => new DialogCloseAtom(owner as DialogBond)
	});

	const closeProps = $derived(mergeAtomProps(atom, preset ?? 'dialog.close-button', restProps));

	function onclick_(ev: MouseEvent) {
		onclick?.(ev);
		if (ev.defaultPrevented) return;

		(closeProps.onclick as ((ev: MouseEvent) => void) | undefined)?.(ev);
	}
</script>

<HtmlAtom
	{as}
	{bond}
	class={['cursor-pointer', '$preset', klass]}
	{...closeProps}
	onclick={onclick_}
>
	{#if children}
		{@render children?.({ dialog: bond })}
	{:else}
		<Icon>
			<Close />
		</Icon>
	{/if}
</HtmlAtom>
