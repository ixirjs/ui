<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { TabsContext } from './bond.svelte';
	import type { TabsContentProps } from './types';

	const bond = TabsContext.get();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let { children = undefined, ...restProps }: TabsContentProps = $props();

	const value = $derived(bond?.props.value);
	const items = $derived(Array.from(bond?.tabContents ?? []));

	// This part owns no element: its presentation (the `tabs.content` preset, its layer and its
	// own attributes) resolves here and lands on every registered panel.
	const content = Kernel.element(() => restProps, {
		preset: 'tabs.content',
		class: '',
		state: bond,
		layer: () => bond?.props.presets?.content
	});
</script>

{#each items as item (item.value)}
	{@render item.render({
		...(item.props ?? {}),
		...(value === item.value ? {} : { children: undefined }),
		...content.attrs,
		selected: value === item.value
	})}
{/each}
