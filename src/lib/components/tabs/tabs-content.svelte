<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { type Base } from '$svelte-atoms/core/components/atom';
	import { TabsBond } from './bond.svelte';
	import type { TabsContentProps } from './types';

	const bond = TabsBond.get();

	let {
		preset = undefined,
		...restProps
	}: TabsContentProps<E, B> = $props();

	const value = $derived(bond?.state?.props.value);
	const items = $derived(Array.from(bond?.state?.tabContents ?? []));

	const contentProps = $derived({
		preset: preset ?? 'tabs.content',
		...restProps
	});
</script>

{#each items as item (item.value)}
   {@render item.render({
		...(item.props ?? {}),
		...(value === item.value ? {} : {children: undefined}),
		...contentProps,
		selected: value === item.value
   })}
{/each}



