<script lang="ts" generics="Src extends Component = Component">
	import type { Component } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { IconProps } from './types';
	import './icon.css';

	let {
		src = undefined,
		as = 'div',
		base = undefined,
		children = undefined,
		...restProps
	}: IconProps<Src> = $props();

	// Polymorphic by contract (`IconProps<Src, E, B>`), so it dispatches: `as` and `base` stay honoured.
	const el = Kernel.element(() => restProps, {
		preset: 'icon',
		class:
			'ixir-icon inline-flex aspect-square h-6 items-center justify-center leading-none text-current',
		as: () => as,
		base: () => base
	});
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, src ? sourceSnippet : children)}

{#snippet sourceSnippet()}
	{@const Src = src}
	<Src />
{/snippet}
