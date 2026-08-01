<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import type { SlideoverBackdropProps } from './types';
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { usePart } from '$ixirjs/ui/shared';
	import { DrawerBond } from './bond.svelte';

	let {
		class: klass = '',
		preset = undefined,
		...restProps
	}: SlideoverBackdropProps<E, B> = $props();

	const part = usePart(DrawerBond, 'backdrop', () => restProps, {
		preset: () => preset
	});
</script>

<HtmlAtom
	class={['border-border absolute inset-0 bg-black/30', '$preset', klass]}
	{...restProps}
	{part}
/>
