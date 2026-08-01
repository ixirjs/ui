<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { usePart } from '$ixirjs/ui/shared';
	import { AlertBond } from './bond.svelte';
	import type { AlertDescriptionProps } from './types';

	let {
		class: klass = '',
		as = 'p' as E,
		preset = undefined,
		children = undefined,
		...restProps
	}: AlertDescriptionProps<E, B> = $props();

	const part = usePart(AlertBond, 'description', () => restProps, {
		context: 'optional',
		preset: () => preset
	});
	const bond = part.bond;
</script>

<HtmlAtom
	class={['alert-description border-border mt-1 text-sm leading-relaxed', '$preset', klass]}
	{as}
	{...restProps}
	{part}
>
	{@render children?.({ alert: bond! })}
</HtmlAtom>
