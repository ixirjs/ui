<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { bindBond } from '$svelte-atoms/core/shared/bond/bind.svelte';
	import { type Base } from '$svelte-atoms/core/components/atom';
	import Teleport from '$svelte-atoms/core/components/portal/teleport.svelte';
	import { SidebarBond } from './bond.svelte';
	import type { SidebarRootProps } from './types';
	import { ZLayer } from '../portal/zlayer.svelte';

	let {
		open = $bindable(false),
		disabled = false,
		'z-index': zindex = 0,
		overlay: asOverlay = false,
		portal = undefined,
		class: klass = '',
		factory = (props) => SidebarBond.create(props),
		children = undefined,
		...restProps
	}: SidebarRootProps<E, B> = $props();

	let openState = $derived(open);

	// ZLayer only on the teleported path: in-flow has no stacking context to order,
	// so it carries no layer. `overlay` is structural — read once at mount.
	// svelte-ignore state_referenced_locally
	const baseLayer = asOverlay ? new ZLayer('modal', () => 0) : undefined;
	const layerOffset = $derived(
		typeof zindex === 'function'
			? zindex(baseLayer?.value ?? 0) - (baseLayer?.value ?? 0)
			: typeof zindex === 'number' && Number.isFinite(zindex)
				? zindex
				: 0
	);
	// svelte-ignore state_referenced_locally
	const layer = asOverlay ? new ZLayer('modal', () => layerOffset).share() : undefined;

	const binding = bindBond<SidebarBond>((props) => factory(props), {
		open: [
			() => openState,
			(v) => {
				openState = v;
				open = openState;
			}
		],
		disabled: () => disabled,
		// Vestigial: element-less context root, no typed channel to forward restProps.
		rest: () => restProps
	});
	const bond = binding.bond.share();

	export function getBond() {
		return bond;
	}
</script>

<!-- `layer` is truthy iff `overlay` was set at mount. -->
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
