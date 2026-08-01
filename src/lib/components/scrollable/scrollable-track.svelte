<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import type { ScrollableTrackProps } from './types';
	import { ScrollableBond, ScrollableTrackAtom } from './bond.svelte';
	import { createAtomInstance } from '$ixirjs/ui/shared/bond';
	import { mergeAtomProps, HtmlAtom, type Base } from '$ixirjs/ui/components/atom';

	let {
		class: klass = '',
		preset = undefined,
		orientation = 'vertical',
		children,
		...restProps
	}: ScrollableTrackProps<E, B> = $props();

	const bond = ScrollableBond.getOrThrow('ScrollableTrack must be used within a ScrollableRoot');

	const hasYScroll = $derived(bond.props.scrollHeight > bond.props.clientHeight);
	const hasXScroll = $derived(bond.props.scrollWidth > bond.props.clientWidth);
	const hasScroll = $derived(hasXScroll || hasYScroll);
	const isOpen = $derived(bond?.props?.open ?? true);
	const isScrolling = $derived(bond?.props?.isScrolling ?? false);

	const atom = createAtomInstance(undefined, {
		resolveKey: () => (orientation === 'horizontal' ? 'trackX' : 'trackY'),
		bond,
		factory: (owner, key) => new ScrollableTrackAtom(owner!, key === 'trackX' ? 'x' : 'y')
	});

	const trackProps = $derived(mergeAtomProps(atom, preset ?? 'scrollable.track', restProps));
</script>

{#if (isOpen || isScrolling) && hasScroll}
	<HtmlAtom
		{bond}
		as="div"
		class={[
			'scrollable-track bg-foreground/10 hover:bg-foreground/15 absolute z-10 rounded transition-opacity',
			{ vertical: 'inset-y-0 right-0 w-2', horizontal: 'inset-x-0 bottom-0 h-2' }[orientation],
			'$preset',
			klass
		]}
		{...trackProps}
	>
		{@render children?.()}
	</HtmlAtom>
{/if}
