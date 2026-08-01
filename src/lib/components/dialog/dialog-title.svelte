<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'h2', B extends Base = Base">
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
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

	const el = usePartElement(part, () => ({
		as,
		// This part declares no base classes; `''` is exactly HtmlAtom's own `class` default.
		class: '',
		...restProps
	}));
</script>

{#snippet body()}
	{@render children?.({ dialog: bond })}
{/snippet}

{@render partElement(el, body)}
