<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { PresetModuleName } from '$ixirjs/ui/preset';
	import { SelectContext } from './bond.svelte';

	const bond = SelectContext.getOrThrow('SelectPlaceholder must be used within a Select');

	let { children = undefined, ...restProps } = $props();

	const id = Kernel.id(bond.id, `${bond.name}-placeholder`);
	const hasValue = $derived(!!bond.props.values?.length);

	const el = Kernel.element(() => restProps, {
		preset: `${bond.name}.placeholder` as PresetModuleName,
		class:
			'border-border absolute inset-0 flex h-full w-full items-center px-2 leading-1 opacity-50 outline-none',
		state: bond,
		layer: () => bond.props.presets?.placeholder,
		attrs: () => ({ id, role: 'group' })
	});
	// Bound once: an identifier callee in `{@render}` compiles to a direct call — no snippet block,
	// no hydration anchor.
	const leaf = Kernel.render(el);
</script>

{@render (!hasValue ? placeholder : undefined)?.()}

{#snippet placeholder()}
	{@render leaf(el, children)}
{/snippet}
