<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
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

	const el = usePartElement(part, () => ({
		class: ['flex w-full px-4 text-xl', '$preset', klass],
		...restProps
	}));
</script>

{@render partElement(el, children, { dialog: bond })}
