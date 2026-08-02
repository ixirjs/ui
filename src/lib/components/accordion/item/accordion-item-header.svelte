<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { usePart } from '$ixirjs/ui/shared';
	import { AccordionItemBond } from './bond.svelte';
	import type { AccordionItemHeaderProps } from './types';

	let {
		class: klass = '',
		as = 'button',
		children = undefined,
		preset = undefined,
		...restProps
	}: AccordionItemHeaderProps<E, B> = $props();

	const part = usePart(AccordionItemBond, 'header', () => restProps, {
		preset: () => preset
	});
	const bond = part.bond;

	const el = usePartElement(part, () => ({
		as,
		class: [
			'border-border relative box-border flex w-full cursor-pointer items-center',
			'$preset',
			klass
		],
		tabindex: as !== 'button' ? 0 : undefined,
		...restProps
	}));
</script>

{@render partElement(el, body)}

{#snippet body()}
	{@render (bond ? headerContent : undefined)?.()}
{/snippet}

<!-- `bond!` is proven by the dispatch above; narrowing does not cross into a snippet body. -->
{#snippet headerContent()}
	{@render children?.({ accordionItem: bond! })}
{/snippet}
