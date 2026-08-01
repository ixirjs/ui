<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import type { SlideoverHeaderProps } from './types';
	import { DrawerBond } from './bond.svelte';
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { usePart } from '$ixirjs/ui/shared';

	let {
		preset = undefined,
		children = undefined,
		...restProps
	}: SlideoverHeaderProps<E, B> = $props();

	const part = usePart(DrawerBond, 'header', () => restProps, {
		preset: () => preset
	});
	const bond = part.bond;
</script>

<HtmlAtom {...restProps} {part}>
	{@render children?.({ drawer: bond })}
</HtmlAtom>
