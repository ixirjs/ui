<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import type { ScrollableTrackProps } from './types';
	import { ScrollableBond } from './bond.svelte';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { mergePresetProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';

	let {
		class: klass = '',
		preset = undefined,
		orientation = 'vertical',
		children,
		...restProps
	}: ScrollableTrackProps<E, B> = $props();

	const bond = ScrollableBond.getOrThrow('ScrollableTrack must be used within a ScrollableRoot');

	const hasYScroll = $derived(bond.state.props.scrollHeight > bond.state.props.clientHeight);
	const hasXScroll = $derived(bond.state.props.scrollWidth > bond.state.props.clientWidth);
	const hasScroll = $derived(hasXScroll || hasYScroll);
	const isOpen = $derived(bond?.state?.props?.open ?? true);
	const isScrolling = $derived(bond?.state?.props?.isScrolling ?? false);

	const atom = createAtomInstance(() => (orientation === 'horizontal' ? 'trackX' : 'trackY'), {
		bond,
		factory: (owner, key) => (key === 'trackX' ? owner!.trackX() : owner!.trackY())
	});

	const trackProps = $derived(
		mergePresetProps(preset, 'scrollable.track', { ...atom.spread, ...restProps })
	);
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
