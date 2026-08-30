<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { ListRootProps } from './types';

	let { as = 'ul', base = undefined, children = undefined, ...restProps }: ListRootProps = $props();

	// Polymorphic by contract (`ListRootProps<E, B>`), so it dispatches: `as` and `base` stay honoured.
	const el = Kernel.element(() => restProps, {
		preset: 'list.root',
		class: 'flex flex-col',
		as: () => as,
		base: () => base
	});
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children)}
