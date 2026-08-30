<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { TabsContext } from './bond.svelte';
	import type { TabsHeaderProps } from './types';

	let { as = undefined, base = undefined, children, ...restProps }: TabsHeaderProps = $props();
	const bond = TabsContext.getOrThrow('<Tabs.Header /> must be used within a <Tabs.Root />');

	// The tablist receives the navigation keydown: tab headers are portaled into it, so their
	// arrow keys bubble here.
	const el = Kernel.element(() => restProps, {
		preset: 'tabs.header',
		class: 'relative flex min-w-full',
		state: bond,
		layer: () => bond.props.presets?.header,
		as: () => as,
		base: () => base,
		attrs: () => ({
			id: bond.headerId,
			role: 'tablist',
			onkeydown: (event: KeyboardEvent) => bond.onkeydown(event)
		})
	});
	// Bound once: an identifier callee compiles to a direct call — no snippet block, no anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children, { tabs: bond })}
