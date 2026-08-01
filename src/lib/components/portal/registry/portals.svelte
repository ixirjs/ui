<script lang="ts">
	import type { PortalsProps, PortalsStateProps } from './bond.svelte';
	import { PortalsBond } from './bond.svelte';
	import { useRoot } from '$ixirjs/ui/shared';
	import type { Factory } from '$ixirjs/ui/types';

	let { id, factory = defaultFactory, children = undefined }: PortalsProps = $props();

	// `id` is declared in the props spec here, not seeded through options: this registry's identity
	// is its caller-supplied `id` prop.
	const root = useRoot(
		PortalsBond,
		{ id: () => id },
		{ atom: false, factory: (props) => (factory as Factory<PortalsBond>)(props) }
	);
	const bond = root.bond;

	function defaultFactory(props: PortalsStateProps) {
		return PortalsBond.create(props);
	}
</script>

{@render children?.({ portals: bond })}
