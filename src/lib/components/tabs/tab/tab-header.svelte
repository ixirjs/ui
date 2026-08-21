<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { TabBond } from './bond.svelte';
	const PART = Kernel.plan(TabBond, 'header', { class: '' });
</script>

<script lang="ts" generics="E extends HtmlElementTagName = 'button', B extends Base = Base">
	import type { TabHeaderProps } from '$ixirjs/ui/components/tabs/types';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';

	let {
		class: klass = '',
		preset = undefined,
		children,
		...restProps
	}: TabHeaderProps<E, B> & BasePropsOf<B> = $props();

	const part = Kernel.node(PART, () => ({ preset }), { context: 'required' });
	const bond = part.bond;
	const isActive = $derived(bond.isActive);
	const isDisabled = $derived(bond.props.disabled);

	const el = Kernel.element(part, () => ({
		as: 'button',
		class: [
			'text-foreground/50 bg-foreground/0 hover:bg-foreground/5 active:bg-foreground/10 flex cursor-pointer items-center px-2 py-2 text-sm font-medium transition-colors duration-100',
			isActive && 'text-primary bg-primary/5 hover:bg-primary/10 active:bg-primary/15',
			isDisabled && 'opacity-50',
			'$preset',
			klass
		],
		type: 'button',
		disabled: isDisabled,
		...restProps
	}));
</script>

{@render Kernel.render(el)(el, children, { tab: bond })}
