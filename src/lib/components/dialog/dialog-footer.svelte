<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { usePart } from '$ixirjs/ui/shared';
	import { DialogBond } from './bond.svelte';
	import type { DialogFooterProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: DialogFooterProps<E, B> = $props();

	const part = usePart(DialogBond, 'footer', () => restProps, {
		preset: () => preset
	});
	const bond = part.bond;
</script>

<HtmlAtom class={['flex px-4', '$preset', klass]} {...restProps} {part}>
	{@render children?.({ dialog: bond })}
</HtmlAtom>
