<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { AccordionContext, AccordionItemContext, WbAccordionItem } from './wb-accordion.svelte';

	const ID = $props.id();
	let {
		value = undefined,
		disabled = false,
		children = undefined,
		...rest
	}: {
		class?: string;
		value?: string;
		disabled?: boolean;
		children?: Snippet<[{ accordionItem: WbAccordionItem }]>;
		[key: string]: unknown;
	} = $props();

	const root = AccordionContext.getOrThrow('WbAccordionItem must be used within a WbAccordion.');
	const item = AccordionItemContext.share(
		new WbAccordionItem(
			root,
			Kernel.id(ID, 'accordion-item'),
			() => value,
			() => disabled
		)
	);
	// Registered at init — document order — and released on teardown.
	const detach = root.attach(item);
	$effect(() => detach);

	const el = Kernel.element(() => rest, {
		preset: 'accordion.item',
		class: 'border-border',
		state: item,
		attrs: () => ({ id: item.id })
	});
</script>

<div {...el.attrs}>{@render children?.({ accordionItem: item })}</div>
