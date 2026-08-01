<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { bindBond } from '$svelte-atoms/core/shared/bind-bond.svelte';
	import { bondFactory } from '$svelte-atoms/core/shared';
	import { type Base } from '$svelte-atoms/core/components/atom';
	import Teleport from '$svelte-atoms/core/components/portal/teleport.svelte';
	import { SidebarBond, SidebarBondState } from './bond.svelte';
	import type { SidebarRootProps } from './types';
	import { ZLayer } from '../portal/zlayer.svelte';

	let {
		open = $bindable(false),
		disabled = false,
		"z-index": zindex = 0,
		overlay: asOverlay = false,
		portal = undefined,
		class: klass = '',
		factory = bondFactory(SidebarBondState, SidebarBond),
		children = undefined,
		...restProps
	}: SidebarRootProps<E, B> = $props();

	const normalizedZIndex = $derived(
		typeof zindex === 'number' && Number.isFinite(zindex) ? zindex : undefined
	);

	// ZLayer only on the teleported path (ADR 0009 D3): in-flow has no stacking context to order,
	// so it carries no layer. `overlay` is structural — read once at mount.
	// svelte-ignore state_referenced_locally
	const layer = asOverlay ? new ZLayer('modal', () => normalizedZIndex ?? 0).share() : undefined;

	const binding = bindBond<SidebarBond>(
		(props) => factory(props),
		{
			open: [() => open, (v) => { open = v; }],
			disabled: () => disabled,
			// Vestigial: element-less context root, no typed channel to forward restProps.
			rest: () => restProps
		}
	);
	const bond = binding.bond.share();


	export function getBond() {
		return bond;
	}
</script>

<!-- `layer` is truthy iff `overlay` was set at mount (ADR 0009 D3). -->
{#if layer}
	<!-- Full-screen pointer-passthrough sink in the root Portal carrying the modal ZLayer;
	     Sidebar.Content positions itself within it. -->
	<Teleport
		portal={portal ?? 'root.l0'}
		class={['pointer-events-none fixed inset-0', klass]}
		style="z-index: {layer.value};"
	>
		{@render children?.({ sidebar: bond })}
	</Teleport>
{:else}
	{@render children?.({ sidebar: bond })}
{/if}
