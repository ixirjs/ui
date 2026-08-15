<script lang="ts">
	import { cn } from '$ixirjs/ui/utils';
	import { useRoot } from '$ixirjs/ui/shared';
	import { Portals } from '$ixirjs/ui/components/portal';
	import { PortalHost } from '$ixirjs/ui/components/portal/instance';
	import { mergePresetProps } from '$ixirjs/ui/components/atom';
	import { RootBond } from './bond.svelte';
	import type { RootProps } from './types';

	const ID = $props.id();

	let {
		class: klass = '',
		base = undefined,
		preset = undefined,
		children = undefined,
		portal = undefined,
		...restProps
	}: RootProps = $props();

	const renderProps = $derived(mergePresetProps(preset, 'root', restProps));

	// Root publishes no renderer registry; each element selects an optional renderer through `base`.
	// See docs/research/root-renderer-slot-2026-08.md.
	const root = useRoot(RootBond, {}, { atom: false, id: () => ID });
	const bond = root.bond;
</script>

<Portals id="root">
	<PortalHost
		{@attach (node: HTMLElement) => {
			bond.rootElement = node;
		}}
		{base}
		id="root.l0"
		class={cn(
			'atom-root bg-background text-foreground relative flex h-full w-full flex-1 flex-col items-start justify-stretch font-sans',
			'$preset',
			klass
		)}
		{...renderProps}
	>
		{@render portal?.()}

		{@render children?.()}
	</PortalHost>
</Portals>
