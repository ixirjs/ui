<script lang="ts">
	import { useRoot } from '$ixirjs/ui/shared';
	import { TabBond, type TabBondProps } from './bond.svelte';
	import { TabsBond } from '$ixirjs/ui/components/tabs/bond.svelte';
	import type { TabRootProps } from '$ixirjs/ui/components/tabs/types';

	// Assert we're inside a <Tabs> (throws otherwise); the bond itself isn't needed here.
	TabsBond.getOrThrow('TabRoot must be used within a Tabs component.');

	const ID = $props.id();

	let {
		value,
		disabled = false,
		data = undefined,
		factory = defaultFactory,
		presets = undefined,
		children
	}: TabRootProps = $props();

	const root = useRoot(
		TabBond,
		{
			value: () => value,
			disabled: () => disabled,
			data: () => data,
			presets: () => presets
		},
		{ atom: false, id: () => ID, factory: (props) => factory(props) }
	);
	const bond = root.bond;

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
