<script lang="ts">
	import { controlledProp, useRoot } from '$ixirjs/ui/shared';
	import { PortalSurface } from '$ixirjs/ui/components/portal';
	import { SidebarBond } from './bond.svelte';
	import type { SidebarRootProps } from './types';

	const ID = $props.id();

	let {
		open = $bindable(false),
		disabled = false,
		'z-index': zindex = 0,
		overlay: asOverlay = false,
		portal = undefined,
		class: klass = '',
		factory = undefined,
		onopenchange = undefined,
		children = undefined
	}: SidebarRootProps = $props();

	const openProp = controlledProp<boolean, SidebarBond>({
		get: () => open,
		set: (value) => (open = value),
		onchange: (value, context) => onopenchange?.(value, context),
		context: (bond) => bond.takeOpenChangeContext()
	});

	const root = useRoot(
		SidebarBond,
		{
			open: openProp,
			disabled: () => disabled
		},
		{ atom: false, id: () => ID, factory: () => factory }
	);
	const bond = root.bond;

	export const getBond = root.getBond;
</script>

<!-- `overlay` is structural — the in-flow path intentionally has no portal or elevation. -->
{@render (asOverlay ? overlaySurface : inlineContent)()}

{#snippet overlaySurface()}
	<PortalSurface
		owner={bond}
		band="modal"
		{portal}
		z-index={zindex}
		class={['pointer-events-none fixed inset-0', klass]}
	>
		{@render inlineContent()}
	</PortalSurface>
{/snippet}

{#snippet inlineContent()}
	{@render children?.({ sidebar: bond })}
{/snippet}
