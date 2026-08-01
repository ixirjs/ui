<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		ActivePortal,
		Portal,
		ZLayer,
	} from '$svelte-atoms/core/components/portal';
	import HtmlAtom from '../atom/html-atom.svelte';
	import { OverlayBond } from './bond.svelte';

	const ID = $props.id();

	// Host-owned portal shared via context so nested overlays default to it, not the global root
	// portal (ADR 0008). Portal.Outer renders in place and captures this host wrapper as the soft
	// containment boundary, so nested overlays anchor/scroll/stack with it and clip softly (floating-ui).
	let { class: klass, children, ...restProps }: { children?: Snippet; [key: string]: any } = $props();

	new ZLayer(0, () => 0, null).share();

	// Read the outer host BEFORE creating our own bond, so delegation captures the right outer isOpen.
	const outerHost = OverlayBond.get();
	const overlayBond = outerHost ? OverlayBond.create(outerHost) : undefined;
	overlayBond?.share();

	const id = `overlay.${ID}`;
</script>


<!-- Host wrapper, captured by Portal.Outer as the container whose rect Portal.Inner tracks (anchor
     frame for nested overlays); `relative` keeps it a positioned box for in-flow content. -->
<HtmlAtom class={["relative", klass]} {...restProps}>
	<!-- In-place portal surface; captures this host as its container so nested overlays clip softly to it. -->
	<Portal.Outer id={id}>
		<Portal.Inner />
	</Portal.Outer>
	
	<ActivePortal portal={id}>
			{@render children?.()}
	</ActivePortal>
</HtmlAtom>