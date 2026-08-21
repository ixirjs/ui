<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { untrack } from 'svelte';
	import type { ScrollableTrackProps } from './types';
	import { ScrollableBond, ScrollableTrackAtom } from './bond.svelte';
	import { createAtomInstance } from '$ixirjs/ui/shared/bond';
	import {
		mergeAtomProps,
		type Base,
		type BasePropsOf,
		type HtmlElementTagName
	} from '$ixirjs/ui/components/atom';

	let {
		class: klass = '',
		preset = undefined,
		orientation = 'vertical',
		children,
		...restProps
	}: ScrollableTrackProps<E, B> & BasePropsOf<B> = $props();

	const bond = ScrollableBond.getOrThrow('ScrollableTrack must be used within a ScrollableRoot');

	const hasYScroll = $derived(bond.props.scrollHeight > bond.props.clientHeight);
	const hasXScroll = $derived(bond.props.scrollWidth > bond.props.clientWidth);
	const hasScroll = $derived(hasXScroll || hasYScroll);
	const isOpen = $derived(bond?.props?.open ?? true);
	const isScrolling = $derived(bond?.props?.isScrolling ?? false);

	const atom = createAtomInstance(
		untrack(() => (orientation === 'horizontal' ? 'trackX' : 'trackY')),
		{
			bond,
			factory: (owner, key) => new ScrollableTrackAtom(owner!, key === 'trackX' ? 'x' : 'y')
		}
	);

	const trackProps = $derived(mergeAtomProps(atom, preset ?? 'scrollable.track', restProps));

	// `mergeAtomProps` already folded the Atom spread into the packet, so Kernel must not read it twice.
	const el = Kernel.element(
		{ atom: undefined, bond, preset: undefined, presetLayer: undefined },
		() => ({
			bond,
			as: 'div',
			class: [
				'scrollable-track bg-foreground/10 hover:bg-foreground/15 absolute z-10 rounded transition-opacity',
				{ vertical: 'inset-y-0 right-0 w-2', horizontal: 'inset-x-0 bottom-0 h-2' }[orientation],
				'$preset',
				klass
			],
			...trackProps
		})
	);
</script>

{@render ((isOpen || isScrolling) && hasScroll ? track : undefined)?.()}

{#snippet track()}
	{@render Kernel.render(el)(el, children)}
{/snippet}
