<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { untrack } from 'svelte';
	import {
		mergeAtomProps,
		type Base,
		type BasePropsOf,
		type HtmlElementTagName
	} from '$ixirjs/ui/components/atom';
	import { ScrollableBond, ScrollableThumbAtom } from './bond.svelte';
	import { createAtomInstance } from '$ixirjs/ui/shared/bond';
	import type { ScrollableThumbProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		children,
		orientation = 'vertical',

		...restProps
	}: ScrollableThumbProps<E, B> & BasePropsOf<B> = $props();

	const bond = ScrollableBond.getOrThrow('ScrollableThumb must be used within a ScrollableRoot');

	const atom = createAtomInstance(
		untrack(() => (orientation === 'horizontal' ? 'thumbX' : 'thumbY')),
		{
			bond,
			factory: (owner, key) => new ScrollableThumbAtom(owner!, key === 'thumbX' ? 'x' : 'y')
		}
	);

	const thumbProps = $derived(mergeAtomProps(atom, preset ?? 'scrollable.thumb', restProps));

	// `mergeAtomProps` already folded the Atom spread into the packet, so Kernel must not read it twice.
	const el = Kernel.element(
		{ atom: undefined, bond, preset: undefined, presetLayer: undefined },
		() => ({
			bond,
			as: 'div',
			class: [
				'scrollable-thumb bg-foreground/10 hover:bg-foreground/20 absolute cursor-grab rounded-md active:cursor-grabbing',
				orientation === 'horizontal' ? 'scrollable-thumb-x' : 'scrollable-thumb-y',
				{ horizontal: 'h-full', vertical: 'w-full' }[orientation],
				'$preset',
				klass
			],
			...thumbProps
		})
	);
</script>

{@render Kernel.render(el)(el, children)}
