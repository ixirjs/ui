<script lang="ts">
	import { SelectBond } from './bond.svelte';
	import { HtmlAtom } from '$svelte-atoms/core/components/atom';

	const bond = SelectBond.get();

	let {
		class: klass = '',
		preset = undefined as string | string[] | undefined,
		children = undefined,
		...restProps
	} = $props();

	const atom = bond?.placeholder();

	const hasValue = $derived(!!bond?.state.props.values?.length);

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
