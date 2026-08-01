<script lang="ts">
	import { bindBond } from '$svelte-atoms/core/shared/bind-bond.svelte';
	import { TabBond, TabBondState, type TabBondProps } from './bond.svelte';
	import { TabsBond } from '../bond.svelte';
	import { type Snippet } from 'svelte';

	const tabsBond = TabsBond.get();

	if (!tabsBond) {
		throw new Error('TabRoot must be used within a Tabs component.');
	}

	let {
		value,
		disabled = false,
		data = undefined as unknown,
		factory = defaultFactory,
		children,
	}: {
		value?: string;
		disabled?: boolean;
		data?: unknown;
		factory?: typeof defaultFactory;
		children?: Snippet<[{ tab: TabBond }]>;
	} = $props();

	const binding = bindBond<TabBond>(
		(props) => factory(props),
		{
			value: () => value,
			disabled: () => disabled,
			data: () => data
		}
	);
	const bond = binding.bond.share();

	const unmount = bond.mount();
	$effect.pre(() => unmount);

	function defaultFactory(props: TabBondProps<unknown>) {
		const bondState = new TabBondState(props);

		return new TabBond(bondState);
	}

	export function getBond() {
		return bond;
	}
</script>

{@render children?.({ tab: bond })}