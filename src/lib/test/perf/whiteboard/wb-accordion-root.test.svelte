<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { AccordionContext, WbAccordion } from './wb-accordion.svelte';

	const ID = $props.id();
	let {
		values = $bindable([]),
		multiple = false,
		collapsible = false,
		disabled = false,
		children = undefined,
		...rest
	}: {
		class?: string;
		values?: string[];
		multiple?: boolean;
		collapsible?: boolean;
		disabled?: boolean;
		children?: Snippet<[{ accordion: WbAccordion }]>;
		[key: string]: unknown;
	} = $props();

	import { BROWSER } from 'esm-env';
	const accordion = AccordionContext.share(
		new WbAccordion(
			ID,
			() => values,
			(v) => (values = v),
			() => multiple,
			() => collapsible,
			() => disabled
		)
	);
	if (BROWSER) queueMicrotask(() => (accordion.settled = true));
	const el = Kernel.element(() => rest, {
		preset: 'accordion',
		class: 'border-border flex w-full flex-col',
		state: accordion,
		attrs: () => {
			const attrs: Record<string, unknown> = { id: Kernel.id(ID, 'accordion-root') };
			if (disabled) attrs['aria-disabled'] = true;
			if (multiple) attrs['aria-multiselectable'] = true;
			return attrs;
		}
	});
</script>

<div {...el.attrs}>{@render children?.({ accordion })}</div>
