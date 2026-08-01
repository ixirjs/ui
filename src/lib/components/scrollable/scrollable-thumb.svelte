<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergePresetProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { ScrollableBond } from './bond.svelte';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import type { ScrollableThumbProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		children,
		orientation = 'vertical',

		...restProps
	}: ScrollableThumbProps<E, B> = $props();

	const bond = ScrollableBond.getOrThrow('ScrollableThumb must be used within a ScrollableRoot');

	const atom = createAtomInstance(() => (orientation === 'horizontal' ? 'thumbX' : 'thumbY'), {
		bond,
		factory: (owner, key) => (key === 'thumbX' ? owner!.thumbX() : owner!.thumbY())
	});

	const thumbProps = $derived(
		mergePresetProps(preset, 'scrollable.thumb', { ...atom.spread, ...restProps })
	);
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
