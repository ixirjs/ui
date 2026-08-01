<script
	lang="ts"
	generics="E extends keyof HTMLElementTagNameMap = 'button', B extends Base = Base"
>
	import type { HTMLAttributes } from 'svelte/elements';
	import { mergePresetProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { AlertBond } from './bond.svelte';
	import type { AlertCloseButtonProps } from './types';
	import { Icon } from '../icon';

	type Element = HTMLElementTagNameMap[E];

	const bond = AlertBond.get();

	let {
		class: klass = '',
		as = 'button' as E,
		preset = undefined,
		children = undefined,
		...restProps
	}: AlertCloseButtonProps<E, B> & HTMLAttributes<Element> = $props();

	const closeButtonProps = $derived(
		mergePresetProps(preset, 'alert.close-button', { ...bond?.closeButton(), ...restProps })
	);
</script>

<HtmlAtom
	{as}
	{bond}
	class={[
		'alert-close-button border-border flex size-6 items-center justify-center rounded p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10',
		'$preset',
		klass
	]}
	{...closeButtonProps}
>
	{#if children}
		{@render children({ alert: bond! })}
	{:else}
		<Icon class="h-full">
			<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 18L18 6M6 6l12 12"
				/>
			</svg>
		</Icon>
	{/if}
</HtmlAtom>
