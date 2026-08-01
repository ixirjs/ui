<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'label', B extends Base = Base">
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
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

	const labelProps = $derived({
		preset: preset ?? atom?.preset,
		...(atom?.spread ?? {}),
		...restProps
	});
</script>

<HtmlAtom class={['flex', '$preset', klass]} {...labelProps}>
	{@render children?.({ field: bond })}
</HtmlAtom>
