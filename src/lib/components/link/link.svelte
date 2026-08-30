<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { LinkProps } from './types';

	let { as = 'a', base = undefined, children = undefined, ...restProps }: LinkProps = $props();

	// Polymorphic by contract (`LinkProps<E, B>`), so it dispatches: `as` and `base` stay honoured.
	const el = Kernel.element(() => restProps, {
		preset: 'link',
		class:
			'hover:text-primary/80 active:text-primary cursor-pointer underline transition-colors duration-200',
		as: () => as,
		base: () => base
	});
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children)}
