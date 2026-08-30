<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { AccordionItemContext } from './bond.svelte';
	import type { AccordionItemHeaderProps } from './types';

	let { children = undefined, ...restProps }: AccordionItemHeaderProps = $props();
	const bond = AccordionItemContext.getOrThrow(
		'<AccordionItem.Header /> must be used within an <AccordionItem.Root />'
	);

	// APG accordion: pointer and Enter/Space toggle; arrows and Home/End move focus and nothing else.
	function onpointerdown(event: PointerEvent) {
		if (event.defaultPrevented || bond.isDisabled) return;
		bond.toggle();
	}
	function onkeydown(event: KeyboardEvent) {
		if (event.defaultPrevented) return;
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			if (!bond.isDisabled) bond.toggle();
			return;
		}
		if (bond.parent.move(bond, event.key)) event.preventDefault();
	}
	function onfocus() {
		bond.parent.notifyFocused(bond.id);
	}

	const el = Kernel.element(() => restProps, {
		preset: 'accordion.item.header',
		class: 'border-border relative box-border flex w-full cursor-pointer items-center',
		state: bond,
		layer: () => bond.props.presets?.header,
		attrs: () => {
			const disabled = bond.isDisabled;
			const open = bond.isOpen;
			const attrs: Record<string, unknown> = {
				id: bond.headerId,
				type: 'button',
				'aria-expanded': open,
				'aria-selected': bond.isActive,
				'data-state': open ? 'open' : 'closed',
				tabindex: bond.parent.isTabStop(bond) ? 0 : -1,
				onpointerdown,
				onkeydown,
				onfocus
			};
			if (open) attrs['aria-controls'] = bond.bodyId;
			if (disabled) {
				attrs['aria-disabled'] = true;
				attrs.disabled = true;
			}
			return attrs;
		}
	});
</script>

<button {...el.attrs}>{@render children?.({ accordionItem: bond })}</button>
