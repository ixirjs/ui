<script lang="ts">
	import { SelectBond } from './bond.svelte';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { usePart } from '@ixirjs/ui/shared';
	import type { PresetKey } from '$ixirjs/ui/preset';

	let {
		class: klass = '',
		preset = undefined as PresetKey | undefined,
		children = undefined,
		...restProps
	} = $props();

	const part = usePart(SelectBond, 'placeholder', () => restProps, {
		preset: () => preset
	});
	const bond = part.bond;
	const hasValue = $derived(!!bond.props.values?.length);

	const el = usePartElement(part, () => ({
		class: [
			'border-border absolute inset-0 flex h-full w-full items-center px-2 leading-1 opacity-50 outline-none',
			'$preset',
			klass
		],
		...restProps
	}));
</script>

{@render (!hasValue ? placeholder : undefined)?.()}

{#snippet placeholder()}
	{@render partElement(el, children)}
{/snippet}
