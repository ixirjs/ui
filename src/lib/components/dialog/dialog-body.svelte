<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import type { DialogBodyProps } from './types';
	import { DialogBond } from './bond.svelte';
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { usePart } from '$ixirjs/ui/shared';

	let {
		class: klass,
		preset = undefined,
		children = undefined,
		...restProps
	}: DialogBodyProps<E, B> = $props();

	const part = usePart(DialogBond, 'body', () => restProps, {
		preset: () => preset
	});
	const bond = part.bond;

	const el = usePartElement(part, () => ({
		class: ['px-4 py-2', '$preset', klass],
		...restProps
	}));
</script>

{@render partElement(el, children, { dialog: bond })}
