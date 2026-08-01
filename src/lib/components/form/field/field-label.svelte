<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'label', B extends Base = Base">
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { FieldBond, FieldLabelAtom } from './bond.svelte';
	import type { FieldLabelProps } from '../types';

	const bond = FieldBond.get();

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: FieldLabelProps<E, B> = $props();

	const atom = bond
		? createAtomInstance<FieldLabelAtom, FieldBond, HTMLElement>('label', {
				bond,
				factory: (owner) => new FieldLabelAtom(owner as FieldBond).role('label')
			})
		: undefined;

	const labelProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<HtmlAtom {bond} class={['flex', '$preset', klass]} {...labelProps}>
	{@render children?.({ field: bond })}
</HtmlAtom>
