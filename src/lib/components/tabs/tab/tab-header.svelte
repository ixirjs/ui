<script
	lang="ts"
	generics="E extends keyof HTMLElementTagNameMap = 'button', B extends Base = Base"
>
	import type { TabHeaderProps } from '$ixirjs/ui/components/tabs/types';
	import { usePart } from '$ixirjs/ui/shared';
	import { TabBond } from './bond.svelte';
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';

	let {
		class: klass = '',
		preset = undefined,
		children,
		...restProps
	}: TabHeaderProps<E, B> = $props();

	const part = usePart(TabBond, 'header', () => restProps, {
		preset: () => preset
	});
	const bond = part.bond;
	const isActive = $derived(bond.isActive);
	const isDisabled = $derived(bond.props.disabled);
</script>

<HtmlAtom
	as="button"
	class={[
		'text-foreground/50 bg-foreground/0 hover:bg-foreground/5 active:bg-foreground/10 flex cursor-pointer items-center px-2 py-2 text-sm font-medium transition-colors duration-100',
		isActive && 'text-primary bg-primary/5 hover:bg-primary/10 active:bg-primary/15',
		isDisabled && 'opacity-50',
		'$preset',
		klass
	]}
	type="button"
	disabled={isDisabled}
	{...restProps}
	{part}
>
	{@render children?.({ tab: bond })}
</HtmlAtom>
