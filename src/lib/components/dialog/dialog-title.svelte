<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'h2', B extends Base = Base">
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { usePart } from '$ixirjs/ui/shared';
	import { DialogBond } from './bond.svelte';
	import type { DialogTitleProps } from './types';

	let {
		preset = undefined,
		as = 'h3' as E,
		children = undefined,
		...restProps
	}: DialogTitleProps<E, B> = $props();

	const part = usePart(DialogBond, 'title', () => restProps, {
		preset: () => preset
	});
	const bond = part.bond;
</script>

<HtmlAtom {as} {...restProps} {part}>
	{@render children?.({ dialog: bond })}
</HtmlAtom>
