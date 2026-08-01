<script lang="ts">
	import type { Component } from 'svelte';
	import { cn, defineState, defineProperty } from '$ixirjs/ui/utils';
	import { useRoot } from '$ixirjs/ui/shared';
	import { Portals } from '$ixirjs/ui/components/portal';
	import { PortalHost } from '$ixirjs/ui/components/portal/instance';
	import { mergePresetProps } from '$ixirjs/ui/components/atom';
	import { HtmlElement } from '$ixirjs/ui/components/element';
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

	const atomProps = $derived(mergePresetProps(preset, 'root', restProps));

	let svg: Component | undefined = $state(undefined);

	type Renderers = {
		html?: Component;
		svg?: Component;
	};

	const renderers = defineState<Renderers>([
		defineProperty('html', () => HtmlElement),
		defineProperty('svg', () => {
			if (!svg) {
				import('$ixirjs/ui/components/element/svg-element.svelte').then((mod) => {
					svg = mod.default;
				});
			}

			return svg;
		})
	]);

	const root = useRoot(
		RootBond,
		{
			renderers: () => renderers
		},
		{ atom: false, id: () => ID, factory: (props) => new RootBond(props) }
	);
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
		{...atomProps}
	>
		{#if portal}
			{@render portal?.()}
		{/if}

		{@render children?.()}
	</PortalHost>
</Portals>
