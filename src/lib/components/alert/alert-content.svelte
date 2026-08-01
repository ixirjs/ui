<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import type { HTMLAttributes } from 'svelte/elements';
	import { mergePresetProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { AlertBond } from './bond.svelte';
	import type { AlertContentProps } from './types';

	type Element = HTMLElementTagNameMap[E];

	const bond = AlertBond.get();

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: AlertContentProps<E, B> & HTMLAttributes<Element> = $props();

	const contentProps = $derived(mergePresetProps(preset, 'alert.content', { ...bond?.content(), ...restProps }));
</script>

<HtmlAtom
	{bond}
	class={['alert-content border-border flex-1 space-y-1', '$preset', klass]}
	{...contentProps}
>
	{@render children?.({ alert: bond! })}
</HtmlAtom>
