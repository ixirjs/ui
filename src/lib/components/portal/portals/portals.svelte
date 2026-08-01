<script lang="ts">
	import type { PortalsProps, PortalsStateProps } from './bond.svelte';
	import { PortalsBond } from './bond.svelte';
	import { bindBond } from '$svelte-atoms/core/shared/bond/bind.svelte';
	import type { Factory } from '$svelte-atoms/core/types';

	let { id, factory = defaultFactory, children = undefined }: PortalsProps = $props();

	const binding = bindBond<PortalsBond>((props) => (factory as Factory<PortalsBond>)(props), {
		id: () => id
	});
	const bond = binding.bond.share();

	function defaultFactory(props: PortalsStateProps) {
		return PortalsBond.create(props).share();
	}
</script>

{@render children?.({ portals: bond })}
