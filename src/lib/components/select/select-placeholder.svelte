<script lang="ts">
	import { SelectBond, SelectPlaceholderAtom } from './bond.svelte';
	import { HtmlAtom } from '$svelte-atoms/core/components/atom';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';

	const bond = SelectBond.get();

	let {
		class: klass = '',
		preset = undefined as string | string[] | undefined,
		children = undefined,
		...restProps
	} = $props();

	const atom = bond
		? createAtomInstance<SelectPlaceholderAtom, SelectBond, HTMLElement>('placeholder', {
				bond,
				factory: (owner) => new SelectPlaceholderAtom(owner as SelectBond)
			})
		: undefined;

	const hasValue = $derived(!!bond?.props.values?.length);

	const presentation = $derived({
		preset: preset ?? atom?.preset ?? 'select.placeholder'
	});

	const placeholderProps = $derived({
		...atom?.spread,
		...restProps
	});
</script>

{#if !hasValue}
	<HtmlAtom
		{bond}
		class={[
			'border-border absolute inset-0 flex h-full w-full items-center px-2 leading-1 opacity-50 outline-none',
			'$preset',
			klass
		]}
		{...presentation}
		{...placeholderProps}
	>
		{@render children?.()}
	</HtmlAtom>
{/if}
