<script lang="ts">
	import { untrack } from 'svelte';
	import { PortalSurface } from '$ixirjs/ui/components/portal';
	import { OverlayContext } from '$ixirjs/ui/components/overlay/model.svelte';
	import { SidebarBond, SidebarContext } from './bond.svelte';
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

	// Live props: the Bond reads through these getters, so a prop change is seen where it is read.
	const bondProps = {
		get id() {
			return ID;
		},
		get open() {
			return open;
		},
		set open(value: boolean | undefined) {
			open = value ?? false;
		},
		get disabled() {
			return disabled;
		}
	};
	// `factory` is read once, at init, by design.
	const build = untrack(() => factory);
	const bond = SidebarContext.share(build ? build(bondProps) : SidebarBond.create(bondProps));
	// Nested popovers gate their `open` on the nearest overlay host.
	OverlayContext.share(bond);
	bond.bindCommit((next, context) => {
		open = next;
		onopenchange?.(next, context);
	});
	export const getBond = () => bond;
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
