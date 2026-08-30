<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { ListGroupProps } from './types';

	let {
		as = 'div',
		base = undefined,
		children = undefined,
		...restProps
	}: ListGroupProps = $props();

	// Polymorphic by contract (`ListGroupProps<E, B>`), so it dispatches: `as` and `base` stay honoured.
	const el = Kernel.element(() => restProps, {
		preset: 'list.group',
		class: 'rounded-b-inherit rounded-t-inherit border-border flex flex-col',
		as: () => as,
		base: () => base
	});
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children)}
