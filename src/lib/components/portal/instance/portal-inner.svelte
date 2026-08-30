<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { PortalInnerProps } from '$ixirjs/ui/components/portal/types';
	import { PortalContext } from './bond.svelte';

	let {
		as = undefined,
		base = undefined,
		children = undefined,
		...restProps
	}: PortalInnerProps = $props();

	const bond = PortalContext.getOrThrow('<Portal.Inner /> must be used within a <Portal.Outer />');

	// The sink is the element itself; minted once so the node is not re-captured per invalidation.
	const sinkKey = createAttachmentKey();
	const capture = (node: HTMLElement) => {
		bond.sink = node;
		return () => {
			if (bond.sink === node) bond.sink = undefined;
		};
	};

	const el = Kernel.element(() => ({ [sinkKey]: capture, ...restProps }), {
		preset: 'portal.inner',
		class: 'relative size-full',
		state: bond,
		as: () => as,
		base: () => base,
		attrs: () => ({ id: Kernel.id(bond.id, 'portal-inner') })
	});
	const leaf = Kernel.render(el);
</script>

<!--
	Teleport sink and floating-ui boundary. `relative size-full` makes it the offsetParent the
	teleported `absolute` overlays anchor against; no overflow clip keeps containment soft.
-->
{@render leaf(el, children, { portal: bond })}
