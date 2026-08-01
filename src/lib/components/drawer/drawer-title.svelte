<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'h3', B extends Base = Base">
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { DrawerBond } from './bond.svelte';
	import type { SlideoverTitleProps } from './types';
	import { usePart } from '$ixirjs/ui/shared';

	let {
		preset = undefined,
		as = 'h3' as E,
		children,
		...restProps
	}: SlideoverTitleProps<E, B> = $props();

	const part = usePart(DrawerBond, 'title', () => restProps, {
		preset: () => preset
	});
	const bond = part.bond;
</script>

<HtmlAtom {as} {...restProps} {part}>
	{@render children?.({ drawer: bond })}
</HtmlAtom>
