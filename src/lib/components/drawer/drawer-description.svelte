<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'p', B extends Base = Base">
	import type { SlideoverDescriptionProps } from './types';
	import { DrawerBond } from './bond.svelte';
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { usePart } from '$ixirjs/ui/shared';

	let {
		preset = undefined,
		as = 'p' as E,
		children,
		...restProps
	}: SlideoverDescriptionProps<E, B> = $props();

	const part = usePart(DrawerBond, 'description', () => restProps, {
		preset: () => preset
	});
	const bond = part.bond;
</script>

<HtmlAtom {as} {...restProps} {part}>
	{@render children?.({ drawer: bond })}
</HtmlAtom>
