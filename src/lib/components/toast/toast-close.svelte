<script
	lang="ts"
	generics="E extends keyof HTMLElementTagNameMap = 'button', B extends Base = Base"
>
	import { Icon } from '$svelte-atoms/core/components/icon';
	import Close from '$svelte-atoms/core/icons/icon-close.svelte';
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { ToastBond } from './bond.svelte';
	import type { ToastCloseProps } from './types';

	let {
		class: klass = '',
		as = 'button' as E,
		preset = undefined,
		children = undefined,
		onclick = undefined,
		...restProps
	}: ToastCloseProps<E, B> = $props();

	const bond = ToastBond.get();

	const atom = bond?.dismiss();

	const closeProps = $derived(mergeAtomProps(atom, preset, restProps));

	function onclick_(ev: MouseEvent) {
		(onclick as ((ev: MouseEvent) => void) | undefined)?.(ev);
		if (ev.defaultPrevented) return;
		(closeProps.onclick as ((ev: MouseEvent) => void) | undefined)?.(ev);
	}
</script>

<HtmlAtom
	{as}
	{bond}
	class={['cursor-pointer text-current h-6', '$preset', klass]}
	{...closeProps}
	onclick={onclick_}
>
	{#if children}
		{@render children({ toast: bond })}
	{:else}
		<Icon class="h-full" src={Close} />
	{/if}
</HtmlAtom>
