<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergeAtomProps, HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { ScrollableBond, ScrollableThumbAtom } from './bond.svelte';
	import { createAtomInstance } from '$ixirjs/ui/shared/bond';
	import type { ScrollableThumbProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		children,
		orientation = 'vertical',

		...restProps
	}: ScrollableThumbProps<E, B> = $props();

	const bond = ScrollableBond.getOrThrow('ScrollableThumb must be used within a ScrollableRoot');

	const atom = createAtomInstance(undefined, {
		resolveKey: () => (orientation === 'horizontal' ? 'thumbX' : 'thumbY'),
		bond,
		factory: (owner, key) => new ScrollableThumbAtom(owner!, key === 'thumbX' ? 'x' : 'y')
	});

	const thumbProps = $derived(mergeAtomProps(atom, preset ?? 'scrollable.thumb', restProps));
</script>

<HtmlAtom
	{bond}
	as="div"
	class={[
		'scrollable-thumb bg-foreground/10 hover:bg-foreground/20 absolute cursor-grab rounded-md active:cursor-grabbing',
		orientation === 'horizontal' ? 'scrollable-thumb-x' : 'scrollable-thumb-y',
		{ horizontal: 'h-full', vertical: 'w-full' }[orientation],
		'$preset',
		klass
	]}
	{...thumbProps}
>
	{@render children?.()}
</HtmlAtom>
