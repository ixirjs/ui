<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { type Base } from '$svelte-atoms/core/components/atom';
	import { TabBond } from './bond.svelte';
	import { TabsBond } from '../bond.svelte';
	import type { TabBodyProps } from '../types';
	import { Stack } from '../../stack';

	const tabBond = TabBond.get();
	const tabsBond = TabsBond.get();

	if (!tabBond) {
		throw new Error('TabBody must be used within a Tab');
	}

	let {
		class: klass = '',
		children,
		preset = undefined,
		...restProps
	}: TabBodyProps<E, B> = $props();

	const atom = tabBond.atom('body');

	const contentProps = $derived({
		preset: preset ?? atom?.preset,
		...atom?.spread,
		...restProps
	});

	const value = $derived(tabBond?.state.props.value);

	// Register content snippet with props and children with tabs on mount
	$effect.pre(() => {
		if(!value) return;
		if(!tabBond) return;
		if(!tabsBond) return;

		tabsBond.state.registerTabContent(value, {
			render: body,
			props: {
				children
			}
		});

		return () => {
			tabsBond.state.unregisterTabContent(value);
		};
	});
</script>

{#snippet body({children = undefined, selected = false, ...props}: Record<string, unknown> = {})}
	<Stack.Item 
		class={['tab-body pointer-events-none flex h-auto w-full min-w-full flex-1 flex-col', selected && 'pointer-events-auto', '$preset', klass]} 
		value={value}
		inert={selected ? undefined : true} 
		{...contentProps} 
		{...props}
	>
		{@render children?.({ ...(tabBond ? { tab: tabBond } : {}), ...(tabsBond ? { tabs: tabsBond } : {}) })}
	</Stack.Item>
{/snippet}

<!-- Content is teleported to Tabs.Content, so we don't render anything here -->
