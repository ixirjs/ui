<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { LabelProps } from './types';

	let {
		for: labelfor = null,
		as = 'label',
		base = undefined,
		children = undefined,
		...restProps
	}: LabelProps = $props();

	// Polymorphic by contract (`LabelProps<E, B>`), so it dispatches: `as` and `base` stay honoured.
	const el = Kernel.element(() => restProps, {
		preset: 'label',
		class: 'font-medium',
		as: () => as,
		base: () => base,
		attrs: () => ({ for: labelfor })
	});
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children, {})}
