<script lang="ts" generics="T extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { DropdownBond } from './bond.svelte';
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';

	const bond = DropdownBond.get();

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	} = $props();

	const hasValue = $derived(!!bond?.state.props.values?.length);

	const placeholderProps = $derived({
		preset: preset ?? 'dropdown.placeholder',
		...bond?.placeholder(),
		...restProps
	});
</script>

{#if !hasValue}
	<HtmlAtom
		{bond}
		class={[
			'absolute inset-0 flex h-full w-full items-center px-2 leading-1 opacity-50 outline-none',
			'$preset',
			klass
		]}
		{...placeholderProps}
	>
		{@render children?.()}
	</HtmlAtom>
{/if}
