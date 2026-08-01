<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'p', B extends Base = Base">
	import { mergePresetProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { FieldBond } from './bond.svelte';
	import type { FieldTextProps } from '../types';

	const bond = FieldBond.get();

	let {
		class: klass = '',
		as = 'p' as E,
		children = undefined,
		preset = undefined,
		...restProps
	}: FieldTextProps<E, B> = $props();

	const helperTextProps = $derived(mergePresetProps(preset, 'field.helper-text', restProps));
</script>

<HtmlAtom
	{as}
	class={['text-muted-foreground mt-1 text-xs', '$preset', klass]}
	{...helperTextProps}
>
	{@render children?.({ field: bond })}
</HtmlAtom>