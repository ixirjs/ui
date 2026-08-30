<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { Motion, PresetLike } from '$ixirjs/ui/preset';
	import { ActivePortal, Portal } from '$ixirjs/ui/components/portal';
	const ID = $props.id();

	let {
		id: idProp = undefined,
		elementId = undefined,
		base = undefined,
		children,
		...restProps
	}: {
		id?: string;
		elementId?: string;
		base?: unknown;
		children?: Snippet;
		[key: string]: unknown;
	} = $props();

	// `id` names the PORTAL this host opens (`Root` names its own `root.l0`), never the wrapper
	// element — `Portal.Outer` renders an element carrying it. A part that must address its own
	// element by id passes `elementId` as well.
	const id = $derived(idProp ?? `portal-host.${ID}`);

	// `presetLayer`/`defaults` arrive from a part that hands this host its props packet
	// (Dialog.Content); they are the layer and the motion of that part's element.
	const el = Kernel.element(() => restProps, {
		class: 'relative',
		base: () => base,
		layer: () => restProps.presetLayer as PresetLike | undefined,
		motion: () => (restProps.motion ?? restProps.defaults) as Motion<never> | undefined,
		attrs: () => (elementId ? { id: elementId, 'data-host-id': id } : { 'data-host-id': id })
	});
	const leaf = Kernel.render(el);
</script>

<!-- Host wrapper, captured by Portal.Outer as the container whose rect Portal.Inner tracks (anchor
     frame for nested overlays); `relative` keeps it a positioned box for in-flow content. -->
{@render leaf(el, hostBody)}

{#snippet hostBody()}
	<!-- In-place portal surface; captures this host as its container so nested overlays clip softly to it. -->
	<Portal.Outer {id}>
		<Portal.Inner />
	</Portal.Outer>

	<ActivePortal portal={id}>
		{@render children?.()}
	</ActivePortal>
{/snippet}
