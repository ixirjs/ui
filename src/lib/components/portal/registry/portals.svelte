<script lang="ts">
	import { untrack } from 'svelte';
	import { PortalsBond, PortalsContext, type PortalsProps } from './bond.svelte';

	let { id, factory = undefined, children = undefined }: PortalsProps = $props();

	const bondProps = {
		get id() {
			return id;
		}
	};
	const build = untrack(() => factory);
	const bond = PortalsContext.share(build ? build(bondProps) : PortalsBond.create(bondProps));
</script>

{@render children?.({ portals: bond })}
