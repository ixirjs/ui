<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { Portals } from '$ixirjs/ui/components/portal';
	import { PortalHost } from '$ixirjs/ui/components/portal/instance';
	import { RootBond, RootContext } from './bond.svelte';
	import type { RootProps } from './types';

	const ID = $props.id();

	let {
		base = undefined,
		children = undefined,
		portal = undefined,
		...restProps
	}: RootProps = $props();

	// Root publishes no renderer registry; each element selects an optional renderer through `base`.
	// See docs/research/root-renderer-slot-2026-08.md.
	const bond = RootContext.share(RootBond.create({ id: ID, extend: {} }));

	// The host is another component, so the resolved attrs are handed to it rather than spread on a
	// literal tag.
	const el = Kernel.element(() => restProps, {
		preset: 'root',
		class:
			'atom-root bg-background text-foreground relative flex h-full w-full flex-1 flex-col items-start justify-stretch font-sans',
		state: bond
	});
</script>

<Portals id="root">
	<PortalHost
		{@attach (node: HTMLElement) => {
			bond.rootElement = node;
		}}
		{base}
		id="root.l0"
		{...el.attrs}
	>
		{@render portal?.()}

		{@render children?.()}
	</PortalHost>
</Portals>
