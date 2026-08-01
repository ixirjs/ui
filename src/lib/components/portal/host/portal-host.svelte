<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ActivePortal, Portal } from '$svelte-atoms/core/components/portal';
	import HtmlAtom from '../../atom/html-atom.svelte';
	// import { OverlayBond } from './bond.svelte';

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

	// Read the outer host BEFORE creating our own bond, so delegation captures the right outer isOpen.
	// const outerHost = OverlayBond.get();
	// const overlayBond = outerHost ? OverlayBond.create(outerHost) : undefined;
	// overlayBond?.share();

	const id = $derived(idProp ?? `portal-host.${ID}`);
</script>

<!-- Host wrapper, captured by Portal.Outer as the container whose rect Portal.Inner tracks (anchor
     frame for nested overlays); `relative` keeps it a positioned box for in-flow content. -->
<HtmlAtom class={['relative', klass]} {...restProps} data-host-id={id}>
	<!-- In-place portal surface; captures this host as its container so nested overlays clip softly to it. -->
	<Portal.Outer {id}>
		<Portal.Inner />
	</Portal.Outer>

	<ActivePortal portal={id}>
		{@render children?.()}
	</ActivePortal>
</HtmlAtom>
