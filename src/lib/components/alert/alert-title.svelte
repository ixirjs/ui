<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { usePart } from '$ixirjs/ui/shared';
	import { AlertBond } from './bond.svelte';
	import type { AlertTitleProps } from './types';

	let {
		as = 'h4' as E,
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: AlertTitleProps<E, B> = $props();

	const part = usePart(AlertBond, 'title', () => restProps, {
		context: 'optional',
		preset: () => preset
	});
	const bond = part.bond;
</script>

<HtmlAtom
	{as}
	class={['alert-title border-border text-sm leading-tight font-medium', '$preset', klass]}
	{...restProps}
	{part}
>
	{@render children?.({ alert: bond! })}
</HtmlAtom>
