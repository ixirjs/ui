<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { AccordionItemBond } from './bond.svelte';
	const PART = Kernel.part(AccordionItemBond, 'header', { class: '' });
</script>

<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import type { AccordionItemHeaderProps } from './types';

	let {
		class: klass = '',
		as = 'button',
		children = undefined,
		preset = undefined,
		...restProps
	}: AccordionItemHeaderProps<E, B> & BasePropsOf<B> = $props();

	const part = Kernel.node(PART, () => ({ preset }), { context: 'required' });
	const bond = part.bond;

	const el = Kernel.element(part, () => ({
		as,
		class: [
			'border-border relative box-border flex w-full cursor-pointer items-center',
			'$preset',
			klass
		],
		...restProps
	}));
</script>

{@render Kernel.render(el)(el.tag(), el.class(), el.attrs(), body, undefined, el.motion(), el)}

{#snippet body()}
	{@render (bond ? headerContent : undefined)?.()}
{/snippet}

<!-- `bond!` is proven by the dispatch above; narrowing does not cross into a snippet body. -->
{#snippet headerContent()}
	{@render children?.({ accordionItem: bond! })}
{/snippet}
