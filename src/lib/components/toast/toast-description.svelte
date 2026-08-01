<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'p', B extends Base = Base">
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { ToastBond } from './bond.svelte';
	import type { ToastDescriptionProps } from './types';
	import { usePart } from '$ixirjs/ui/shared';

	let {
		as = 'p' as E,
		preset = undefined,
		children = undefined,
		...restProps
	}: ToastDescriptionProps<E, B> = $props();

	const part = usePart(ToastBond, 'description', () => restProps, {
		preset: () => preset
	});

	const el = usePartElement(part, () => ({
		as,
		// This part declares no base classes; `''` is exactly HtmlAtom's own `class` default.
		class: '',
		...restProps
	}));
</script>

{#snippet body()}
	{@render children?.({ toast: part.bond })}
{/snippet}

{@render partElement(el, body)}
