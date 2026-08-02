<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
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

	const el = usePartElement(part, () => ({
		class: ['relative flex min-w-full', '$preset', klass],
		...restProps
	}));
</script>

{@render partElement(el, children, { tabs: part.bond })}
