<script lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import type { Snippet } from 'svelte';
	import { ActivePortal, Portal } from '$ixirjs/ui/components/portal';
	const ID = $props.id();

	// Host-owned portal shared via context so nested overlays default to it, not the global root
	// portal. Portal.Outer renders in place and captures this host wrapper as the soft
	// containment boundary, so nested overlays anchor/scroll/stack with it and clip softly (floating-ui).
	let {
		id: idProp = undefined,
		class: klass,
		children,
		...restProps
	}: { id?: string; children?: Snippet; [key: string]: unknown } = $props();

	const id = $derived(idProp ?? `portal-host.${ID}`);

	// Element seam instead of a component boundary; key order matches the previous call exactly.
	const el = Kernel.element(Kernel.static, () => ({
		class: ['relative', klass],
		...restProps,
		'data-host-id': id
	}));
</script>

<!-- Host wrapper, captured by Portal.Outer as the container whose rect Portal.Inner tracks (anchor
     frame for nested overlays); `relative` keeps it a positioned box for in-flow content. -->
{@render Kernel.render(el)(el.tag(), el.class(), el.attrs(), hostBody, undefined, el.motion(), el)}

{#snippet hostBody()}
	<!-- In-place portal surface; captures this host as its container so nested overlays clip softly to it. -->
	<Portal.Outer {id}>
		<Portal.Inner />
	</Portal.Outer>

	<ActivePortal portal={id}>
		{@render children?.()}
	</ActivePortal>
{/snippet}
