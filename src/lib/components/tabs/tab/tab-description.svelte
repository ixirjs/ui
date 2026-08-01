<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'p', B extends Base = Base">
	import type { TabDescriptionProps } from '$ixirjs/ui/components/tabs/types';
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { usePart } from '$ixirjs/ui/shared';
	import { TabBond } from './bond.svelte';

	let {
		preset = undefined,
		as = 'p' as E,
		children,
		...restProps
	}: TabDescriptionProps<E, B> = $props();

	const part = usePart(TabBond, 'description', () => restProps, {
		preset: () => preset
	});
</script>

<HtmlAtom {as} {...restProps} {part}>
	{@render children?.({ tab: part.bond })}
</HtmlAtom>
