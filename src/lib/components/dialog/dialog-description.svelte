<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'p', B extends Base = Base">
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { usePart } from '$ixirjs/ui/shared';
	import type { DialogDescriptionProps } from './types';
	import { DialogBond } from './bond.svelte';

	let {
		preset = undefined,
		as = 'p' as E,
		children = undefined,
		...restProps
	}: DialogDescriptionProps<E, B> = $props();

	const part = usePart(DialogBond, 'description', () => restProps, {
		preset: () => preset
	});
	const bond = part.bond;

	const el = usePartElement(part, () => ({
		as,
		// This part declares no base classes; `''` is exactly HtmlAtom's own `class` default.
		class: '',
		...restProps
	}));
</script>

{@render partElement(el, children, { dialog: bond })}
