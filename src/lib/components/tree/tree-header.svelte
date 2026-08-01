<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import type { HTMLAttributes } from 'svelte/elements';
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
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

	const atom = createAtomInstance('header', {
		bond,
		factory: (owner) => owner!.header()
	});

	const headerProps = $derived(mergeAtomProps(atom, preset, restProps));

	function handlePointerDown(ev: PointerEvent & { currentTarget: EventTarget & Element }) {
		onpointerdown?.(ev);
		if (ev.defaultPrevented) return;
		(headerProps.onpointerdown as ((ev: PointerEvent) => void) | undefined)?.(ev);
	}
</script>

<HtmlAtom
	{bond}
	class={['cursor-pointer', '$preset', klass]}
	{...headerProps}
	onpointerdown={handlePointerDown}
>
	{@render children?.({ tree: bond })}
</HtmlAtom>
