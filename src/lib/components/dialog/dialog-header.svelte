<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { usePart } from '$ixirjs/ui/shared';
	import type { DialogHeaderProps } from './types';
	import { DialogBond } from './bond.svelte';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: DialogHeaderProps<E, B> = $props();

	const part = usePart(DialogBond, 'header', () => restProps, {
		preset: () => preset
	});
	const bond = part.bond;
</script>

<HtmlAtom class={['flex w-full px-4 text-xl', '$preset', klass]} {...restProps} {part}>
	{@render children?.({ dialog: bond })}
</HtmlAtom>
