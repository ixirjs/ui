<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { usePart } from '$ixirjs/ui/shared';
	import { AlertBond } from './bond.svelte';
	import type { AlertContentProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: AlertContentProps<E, B> = $props();

	const part = usePart(AlertBond, 'content', () => restProps, {
		context: 'optional',
		preset: () => preset
	});
	const bond = part.bond;
</script>

<HtmlAtom
	class={['alert-content border-border flex-1 space-y-1', '$preset', klass]}
	{...restProps}
	{part}
>
	{@render children?.({ alert: bond! })}
</HtmlAtom>
