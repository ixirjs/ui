<script
	lang="ts"
	generics="E extends keyof HTMLElementTagNameMap = 'button', B extends Base = Base"
>
	import type { TabHeaderProps } from '../types';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { TabBond, TabHeaderAtom } from './bond.svelte';
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';

	const bond = TabBond.getOrThrow('TabHeader must be used within a Tab component.');

	const isActive = $derived(bond?.isActive);
	const isDisabled = $derived(bond?.props.disabled);

	let {
		class: klass = '',
		preset = undefined,
		children,
		onclick,
		...restProps
	}: TabHeaderProps<E, B> = $props();

	const atom = createAtomInstance<TabHeaderAtom, TabBond, HTMLElement>('header', {
		bond,
		factory: (owner) => new TabHeaderAtom(owner as TabBond)
	});

	const headerProps = $derived(mergeAtomProps(atom, preset, restProps));

	function handleClick(ev: PointerEvent) {
		if (isDisabled) return;

		onclick?.(ev, { tab: bond });

		if (ev.defaultPrevented) {
			return;
		}

		bond?.select();
	}
</script>

<HtmlAtom
	{bond}
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
	onclick={handleClick}
	{...headerProps}
>
	{@render children?.({ tab: bond })}
</HtmlAtom>
