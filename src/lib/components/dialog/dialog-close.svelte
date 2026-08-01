<script
	lang="ts"
	generics="E extends keyof HTMLElementTagNameMap = 'button', B extends Base = Base"
>
	import { Icon } from '$svelte-atoms/core/components/icon';
	import Close from '$svelte-atoms/core/icons/icon-close.svelte';
	import { mergePresetProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { DialogBond } from './bond.svelte';
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

	const closeProps = $derived(mergePresetProps(preset, 'dialog.close-button', restProps));

	function onclick_(ev: MouseEvent) {
		onclick?.(ev);
		if (ev.defaultPrevented) {
			return;
		}

		bond.state.close();
	}
</script>

<HtmlAtom
	{as}
	{bond}
	class={['border-border cursor-pointer', '$preset', klass]}
	onclick={onclick_}
	{...closeProps}
>
	{#if children}
		{@render children?.({ dialog: bond })}
	{:else}
		<Icon>
			<Close />
		</Icon>
	{/if}
</HtmlAtom>
