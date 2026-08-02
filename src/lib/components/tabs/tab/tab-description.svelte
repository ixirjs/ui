<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'p', B extends Base = Base">
	import type { TabDescriptionProps } from '$ixirjs/ui/components/tabs/types';
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
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

	const el = usePartElement(part, () => ({
		as,
		// This part declares no base classes; `''` is exactly HtmlAtom's own `class` default.
		class: '',
		...restProps
	}));
</script>

{@render partElement(el, children, { tab: part.bond })}
