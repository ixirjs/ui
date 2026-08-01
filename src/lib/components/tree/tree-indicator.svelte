<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { TreeBond } from './bond.svelte';
	import type { TreeIndicatorProps } from './types';

	const bond = TreeBond.getOrThrow('<Tree.Indicator /> must be used within a <Tree.Root />');

	let {
		open = $bindable(false),
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: TreeIndicatorProps<E, B> = $props();

	const atom = createAtomInstance('indicator', {
		bond,
		factory: (owner) => owner!.indicator()
	});

	const indicatorProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<HtmlAtom {bond} class={['aspect-square h-fit', '$preset', klass]} {...indicatorProps}>
	{@render children?.({ tree: bond })}
</HtmlAtom>
