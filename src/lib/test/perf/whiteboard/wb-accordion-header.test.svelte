<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { AccordionItemContext } from './wb-accordion.svelte';

	let {
		children = undefined,
		...rest
	}: { class?: string; children?: Snippet; [key: string]: unknown } = $props();
	const item = AccordionItemContext.getOrThrow('This part must be used within a WbAccordionItem.');

	function onpointerdown(event: PointerEvent) {
		if (event.defaultPrevented || item.isDisabled) return;
		item.toggle();
	}
	function onkeydown(event: KeyboardEvent) {
		if (event.defaultPrevented) return;
		if (item.root.move(item, event.key)) event.preventDefault();
	}
	function onfocus() {
		item.root.focused = item.id;
	}

	// A consumer's `onpointerdown`/`onkeydown` in `rest` composes with these through Kernel's merge:
	// consumer first, ours skipped on `defaultPrevented`.
	const el = Kernel.element(() => rest, {
		preset: 'accordion.item.header',
		class: 'border-border relative box-border flex w-full cursor-pointer items-center',
		state: item,
		attrs: () => {
			const disabled = item.isDisabled;
			const attrs: Record<string, unknown> = {
				id: item.headerId,
				type: 'button',
				'aria-expanded': item.isOpen,
				tabindex: item.root.isTabStop(item) ? 0 : -1,
				onpointerdown,
				onkeydown,
				onfocus
			};
			if (item.isOpen) attrs['aria-controls'] = item.bodyId;
			if (disabled) {
				attrs['aria-disabled'] = true;
				attrs.disabled = true;
			}
			return attrs;
		}
	});
</script>

<button {...el.attrs}>{@render children?.()}</button>
