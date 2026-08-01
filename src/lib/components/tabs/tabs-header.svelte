<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { usePart } from '$ixirjs/ui/shared';
	import { TabsBond } from './bond.svelte';
	import type { TabsHeaderProps } from './types';

	let {
		class: klass = '',
		children,
		preset = undefined,
		...restProps
	}: TabsHeaderProps<E, B> = $props();

	const part = usePart(TabsBond, 'header', () => restProps, {
		preset: () => preset
	});
</script>

<HtmlAtom class={['relative flex min-w-full', '$preset', klass]} {...restProps} {part}>
	{@render children?.({ tabs: part.bond })}
</HtmlAtom>
