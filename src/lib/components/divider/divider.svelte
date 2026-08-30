<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { DividerProps } from './types';

	let {
		class: klass = '',
		as = 'div',
		base = undefined,
		vertical = false,
		transparent = false,
		...restProps
	}: DividerProps = $props();

	// The orientation classes ride in the consumer's class slot, with their own `$preset` sentinel:
	// the last sentinel wins placement, so the preset still lands between them and the consumer's
	// class — exactly where it did — and a preset can still override `my-6`/`mx-6`.
	const el = Kernel.element(
		() => ({
			...restProps,
			class: [
				transparent && 'bg-transparent',
				!vertical && 'my-6 w-full border-b',
				vertical && 'mx-6 h-full border-r',
				!vertical && 'mx-0',
				vertical && 'my-0',
				'$preset',
				klass
			]
		}),
		{
			preset: 'divider',
			class: 'atoms-ui divider border-border',
			as: () => as,
			base: () => base
		}
	);
	const leaf = Kernel.render(el);
</script>

{@render leaf(el)}
