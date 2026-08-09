<script lang="ts">
	import { cn } from '$ixirjs/ui/utils';
	import { InputBond } from '$ixirjs/ui/components/input/bond.svelte';
	import { Swatch as SwatchComponent } from '$ixirjs/ui/components/swatch';

	const bond = InputBond.get();

	let {
		class: klass = '',
		...restProps
	}: {
		class?: string;
		[key: string]: unknown;
	} = $props();

	const colorValue = $derived(bond?.value.get() ?? '');
</script>

<SwatchComponent
	color={colorValue}
	class={cn('my-1 h-[calc(100%-8px)] max-h-6 aspect-square rounded-sm', klass)}
	{...restProps}
/>
