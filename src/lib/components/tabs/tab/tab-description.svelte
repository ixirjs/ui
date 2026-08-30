<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { TabContext } from './bond.svelte';
	import type { TabDescriptionProps } from '$ixirjs/ui/components/tabs/types';

	let { as = undefined, base = undefined, children, ...restProps }: TabDescriptionProps = $props();
	const bond = TabContext.getOrThrow('<Tab.Description /> must be used within a <Tab.Root />');

	// Inert: it contributes no id, and nothing resolves one.
	const el = Kernel.element(() => restProps, {
		preset: 'tab.description',
		class: 'border-border',
		state: bond,
		layer: () => bond.props.presets?.description,
		as: () => as ?? 'p',
		base: () => base
	});
	// Bound once: an identifier callee compiles to a direct call — no snippet block, no anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children, { tab: bond })}
