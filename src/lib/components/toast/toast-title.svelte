<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'p', B extends Base = Base">
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { ToastBond } from './bond.svelte';
	import type { ToastTitleProps } from './types';
	import { usePart } from '$ixirjs/ui/shared';

	let {
		as = 'p' as E,
		preset = undefined,
		children = undefined,
		...restProps
	}: ToastTitleProps<E, B> = $props();

	const part = usePart(ToastBond, 'title', () => restProps, {
		preset: () => preset
	});

	const el = usePartElement(part, () => ({
		as,
		// This part declares no base classes; `''` is exactly HtmlAtom's own `class` default.
		class: '',
		...restProps
	}));
</script>

{@render partElement(el, children, { toast: part.bond })}
