<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { AccordionItemBond } from './bond.svelte';
	const PART = Kernel.plan(AccordionItemBond, 'indicator', { class: '' });
</script>

<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { animate } from '$ixirjs/ui/shared';
	import { Icon } from '$ixirjs/ui/components/icon';
	import IconArrowDown from '$ixirjs/ui/icons/icon-arrow-down.svelte';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import type { AccordionItemIndicatorProps } from './types';

	let {
		class: klass = '',
		children = undefined,
		preset = undefined,
		...restProps
	}: AccordionItemIndicatorProps<E, B> & BasePropsOf<B> = $props();

	const part = Kernel.node(PART, () => ({ preset }), { context: 'required' });
	const bond = part.bond;
	const isOpen = $derived(bond.isOpen ?? false);

	function _animate(node: HTMLElement) {
		return animate(node, { rotate: 180 * +isOpen }, { duration: 0.3, ease: 'anticipate' });
	}

	// Driver-only motion routes straight to HtmlElement.
	const el = Kernel.element(
		{ atom: part.atom, bond: part.bond, preset: part.preset, presetLayer: part.presetLayer },
		() => ({
			animate: _animate,
			class: [
				'border-border pointer-events-none flex items-center justify-center',
				'$preset',
				klass
			],
			...restProps
		})
	);
</script>

{@render Kernel.render(el)(el, children && bond ? consumerIndicator : defaultIndicator)}

<!-- `bond!` is proven by the dispatch above; narrowing does not cross into a snippet body. -->
{#snippet consumerIndicator()}
	{@render children?.({ accordionItem: bond! })}
{/snippet}

{#snippet defaultIndicator()}
	<Icon src={IconArrowDown} />
{/snippet}
