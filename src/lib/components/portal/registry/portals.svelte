<script lang="ts">
	import type { PortalsProps } from './bond.svelte';
	import { PortalsBond } from './bond.svelte';
	import { useRoot } from '$ixirjs/ui/shared';
	import type { Factory } from '$ixirjs/ui/types';

	let { id, factory = undefined, children = undefined }: PortalsProps = $props();

	// `id` is declared in the props spec here, not seeded through options: this registry's identity
	// is its caller-supplied `id` prop.
	const root = useRoot(
		PortalsBond,
		{ id: () => id },
		{ atom: false, factory: () => factory as Factory<PortalsBond> | undefined }
	);
	const bond = root.bond;
</script>

{@render children?.({ portals: bond })}
