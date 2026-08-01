<script
	lang="ts"
	generics="E extends keyof HTMLElementTagNameMap = 'button', B extends Base = Base"
>
	import { Icon } from '$svelte-atoms/core/components/icon';
	import Close from '$svelte-atoms/core/icons/icon-close.svelte';
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { DialogBond } from './bond.svelte';
	import type { DialogCloseButtonProps } from './types';

	const bond = DialogBond.get();

	let {
		class: klass = '',
		preset = undefined,
		as = 'button' as E,
		children = undefined,
		onclick = undefined,
		...restProps
	}: DialogCloseButtonProps<E, B> = $props();

	const closeProps = $derived({
		preset: preset ?? 'dialog.close-button',
		...restProps
	});

	function onclick_(ev: MouseEvent) {
		onclick?.(ev);
		if (ev.defaultPrevented) {
			return;
		}

		bond?.state.close();
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
		{@render children?.()}
	{:else}
		<Icon>
			<Close />
		</Icon>
	{/if}
</HtmlAtom>
