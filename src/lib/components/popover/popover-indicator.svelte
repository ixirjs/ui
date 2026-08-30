<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { PresetModuleName } from '$ixirjs/ui/preset';
	import { animate } from '$ixirjs/ui/authoring';
	import { Icon } from '$ixirjs/ui/components/icon';
	import IconArrowDown from '$ixirjs/ui/icons/icon-arrow-down.svelte';
	import { PopoverContext } from './bond.svelte';
	import type { PopoverIndicatorProps } from './types';

	const bond = PopoverContext.getOrThrow('<Popover.Indicator /> must be used within a <Popover />');

	let {
		as = undefined,
		base = undefined,
		children = undefined,
		...restProps
	}: PopoverIndicatorProps = $props();

	const id = Kernel.id(bond.id, `${bond.name}-indicator`);
	const release = bond.attachPart('indicator', id);
	$effect(() => release);

	const isOpen = $derived(bond.isOpen);

	const bodyArg = { popover: bond };
	const el = Kernel.element(() => restProps, {
		preset: `${bond.name}.indicator` as PresetModuleName,
		class: 'border-border flex h-5 items-center justify-center',
		state: bond,
		as: () => as,
		base: () => base,
		layer: () => bond.props.presets?.indicator,
		attrs: () => ({ id, 'aria-hidden': true, 'aria-live': bond.isOpen ? 'polite' : 'off' })
	});
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children ?? fallback, bodyArg)}

{#snippet fallback()}
	<Icon
		class="h-full"
		src={IconArrowDown}
		animate={(node) => animate(node, { rotate: 180 * +isOpen }, { duration: 0.2 })}
	/>
{/snippet}
