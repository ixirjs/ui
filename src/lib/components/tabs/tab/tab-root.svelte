<script lang="ts">
	import { bindBond } from '$svelte-atoms/core/shared/bond/bind.svelte';
	import { TabBond, type TabBondProps } from './bond.svelte';
	import { TabsBond } from '../bond.svelte';
	import { type Snippet } from 'svelte';

	// Assert we're inside a <Tabs> (throws otherwise); the bond itself isn't needed here.
	TabsBond.getOrThrow('TabRoot must be used within a Tabs component.');

	let {
		value,
		disabled = false,
		data = undefined as unknown,
		factory = defaultFactory,
		children
	}: {
		// Required: it's the tab's selection key (the bond uses it directly in mountItem/select).
		value: string;
		disabled?: boolean;
		data?: unknown;
		factory?: typeof defaultFactory;
		children?: Snippet<[{ tab: TabBond }]>;
	} = $props();

	const binding = bindBond<TabBond>((props) => factory(props), {
		value: () => value,
		disabled: () => disabled,
		data: () => data
	});
	const bond = binding.bond.share();

	const unmount = bond.mount();
	$effect.pre(() => unmount);

	function defaultFactory(props: TabBondProps<unknown>) {
		return TabBond.create(props);
	}

	export function getBond() {
		return bond;
	}
</script>

{@render children?.({ tab: bond })}
