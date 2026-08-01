<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'label', B extends Base = Base">
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { FieldBond } from './bond.svelte';
	import type { FieldLabelProps } from '../types';

	const bond = FieldBond.get();

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: FieldLabelProps<E, B> = $props();

	const atom = bond?.atom('label');

	const labelProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<HtmlAtom class={['flex', '$preset', klass]} {...labelProps}>
	{@render children?.({ field: bond })}
</HtmlAtom>
