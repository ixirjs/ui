<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { TreeBond } from './bond.svelte';
	import type { TreeBodyProps } from './types';
	import { animateTreeBody } from './motion.svelte';

	const bond = TreeBond.getOrThrow('<Tree.Body /> must be used within a <Tree.Root />');

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		fallback = {
			animate: animateTreeBody(),
			initial: animateTreeBody({ duration: 0 })
		},
		...restProps
	}: TreeBodyProps<E, B> = $props();

	const atom = createAtomInstance('body', {
		bond,
		factory: (owner) => owner!.body()
	});

	const bodyProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<HtmlAtom {bond} class={['pl-4', '$preset', klass]} {fallback} {...bodyProps}>
	{@render children?.({ tree: bond })}
</HtmlAtom>
