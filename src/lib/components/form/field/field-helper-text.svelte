<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'p', B extends Base = Base">
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { FieldBond, FieldDescriptionAtom } from './bond.svelte';
	import type { FieldTextProps } from '../types';

	const bond = FieldBond.get();

	let {
		class: klass = '',
		as = 'p' as E,
		children = undefined,
		preset = undefined,
		...restProps
	}: FieldTextProps<E, B> = $props();

	const atom = bond
		? createAtomInstance<FieldDescriptionAtom, FieldBond, HTMLElement>('description', {
				bond,
				factory: (owner) => new FieldDescriptionAtom(owner as FieldBond).role('description')
			})
		: undefined;
	const helperTextProps = $derived(mergeAtomProps(atom, preset ?? 'field.helper-text', restProps));
</script>

<HtmlAtom
	{as}
	{bond}
	class={['text-muted-foreground mt-1 text-xs', '$preset', klass]}
	{...helperTextProps}
>
	{@render children?.({ field: bond })}
</HtmlAtom>
