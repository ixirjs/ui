<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { ListTitleProps } from './types';

	let {
		as = 'h3',
		base = undefined,
		children = undefined,
		...restProps
	}: ListTitleProps = $props();

	// Polymorphic by contract (`ListTitleProps<E, B>`), so it dispatches: `as` and `base` stay honoured.
	const el = Kernel.element(() => restProps, {
		preset: 'list.title',
		class: 'mb-1 flex w-full px-6 py-1 font-medium',
		as: () => as,
		base: () => base
	});
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children)}
