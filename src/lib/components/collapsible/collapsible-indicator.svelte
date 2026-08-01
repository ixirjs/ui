<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { animate as runAnimation } from '@ixirjs/ui/shared';
	import { Icon } from '$ixirjs/ui/components/icon';
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { usePart } from '@ixirjs/ui/shared';
	import IconArrowDown from '$ixirjs/ui/icons/icon-arrow-down.svelte';
	import { CollapsibleBond } from './bond.svelte';
	import type { CollapsibleIndicatorProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		animate = defaultAnimate,
		children = undefined,
		...restProps
	}: CollapsibleIndicatorProps<E, B> = $props();
	const part = usePart(CollapsibleBond, 'indicator', () => restProps, {
		preset: () => preset
	});
	const isOpen = $derived(part.bond.isOpen);

	function defaultAnimate(node: HTMLElement) {
		runAnimation(node, { rotate: 180 * +isOpen }, { duration: 0.3, ease: 'anticipate' });
	}
</script>

<HtmlAtom
	{animate}
	class={['border-border flex size-4 items-center justify-center', '$preset', klass]}
	{...restProps}
	{part}
>
	{#if children}
		{@render children?.({ collapsible: part.bond })}
	{:else}
		<Icon src={IconArrowDown} />
	{/if}
</HtmlAtom>
