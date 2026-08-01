<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import type { HTMLAttributes } from 'svelte/elements';
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { TreeBond } from './bond.svelte';
	import type { TreeHeaderProps } from './types';

	type Element = HTMLElementTagNameMap[E];

	const bond = TreeBond.getOrThrow('<Tree.Header /> must be used within a <Tree.Root />');

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		onpointerdown = undefined,
		...restProps
	}: TreeHeaderProps<E, B> & HTMLAttributes<Element> = $props();

	const atom = bond.atom('header');

	const headerProps = $derived(mergeAtomProps(atom, preset, restProps));

	function handlePointerDown(ev: PointerEvent) {
		onpointerdown?.(ev);

		if (ev.defaultPrevented) {
			return;
		}

		bond?.state.toggle();
	}
</script>

<HtmlAtom
	{bond}
	class={['cursor-pointer', '$preset', klass]}
	onpointerdown={handlePointerDown}
	{...headerProps}
>
	{@render children?.({ tree: bond })}
</HtmlAtom>
