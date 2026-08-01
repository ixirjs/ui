<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import type { DrawerBodyProps } from './types';
	import { DrawerBond } from './bond.svelte';
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { usePart } from '$ixirjs/ui/shared';

	let { preset = undefined, children = undefined, ...restProps }: DrawerBodyProps<E, B> = $props();

	const part = usePart(DrawerBond, 'body', () => restProps, {
		preset: () => preset
	});
	const bond = part.bond;

	const el = usePartElement(part, () => ({
		// This part declares no base classes; `''` is exactly HtmlAtom's own `class` default.
		class: '',
		...restProps
	}));
</script>

{#snippet body()}
	{@render children?.({ drawer: bond })}
{/snippet}

{@render partElement(el, body)}
