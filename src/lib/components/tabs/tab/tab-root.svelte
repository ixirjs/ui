<script lang="ts">
	import { untrack } from 'svelte';
	import { TabBond, TabContext } from './bond.svelte';
	import { TabsContext } from '$ixirjs/ui/components/tabs/bond.svelte';
	import type { TabRootProps } from '$ixirjs/ui/components/tabs/types';

	// Assert we're inside a <Tabs> (throws otherwise); the bond itself isn't needed here.
	TabsContext.getOrThrow('TabRoot must be used within a Tabs component.');

	const ID = $props.id();

	let {
		value,
		disabled = false,
		data = undefined,
		factory = undefined,
		presets = undefined,
		children
	}: TabRootProps = $props();

	const bondProps = {
		get id() {
			return ID;
		},
		get value() {
			return value;
		},
		get disabled() {
			return disabled;
		},
		get data() {
			return data;
		},
		get presets() {
			return presets;
		}
	};
	// `factory` is read once, at init, by design.
	const build = untrack(() => factory);
	const bond = TabContext.share(build ? build(bondProps) : TabBond.create(bondProps));
	// Registered at init — document order — and released on teardown.
	const unmount = bond.mount();
	$effect.pre(() => unmount);
	export const getBond = () => bond;
</script>

{@render children?.({ tab: bond })}
