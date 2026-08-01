<script module lang="ts">
	export type RootPortals = 'root.l0';
</script>

<script lang="ts">
	import { cn, defineState, defineProperty } from '$svelte-atoms/core/utils';
	import { bindBond } from '$svelte-atoms/core/shared/bond/bind.svelte';
	import { ActivePortal, Portals } from '$svelte-atoms/core/components/portal';
	import { PortalHost } from '$svelte-atoms/core/components/portal/host';
	import { mergePresetProps, HtmlAtom } from '$svelte-atoms/core/components/atom';
	import { HtmlElement, SvgElement } from '$svelte-atoms/core/components/element';
	import { RootBond } from './bond.svelte';
	import type { RootProps } from './types';

	let {
		class: klass = '',
		base = undefined,
		preset = undefined,
		children = undefined,
		portal = undefined,
		...restProps
	}: RootProps = $props();

	const atomProps = $derived(mergePresetProps(preset, 'root', restProps));

	let html: typeof HtmlElement | undefined = $state(HtmlElement);
	let svg: typeof SvgElement | undefined = $state(undefined);

	type Renderers = {
		html?: typeof HtmlElement;
		svg?: typeof SvgElement;
	};

	const renderers = defineState<Renderers>([
		defineProperty('html', () => {
			if (!html) {
				import('$svelte-atoms/core/components/element/html-element.svelte').then((mod) => {
					html = mod.default;
				});
			}

			return html;
		}),
		defineProperty('svg', () => {
			if (!svg) {
				import('$svelte-atoms/core/components/element/svg-element.svelte').then((mod) => {
					svg = mod.default;
				});
			}

			return svg;
		})
	]);

	const binding = bindBond<RootBond>((props) => new RootBond(props), {
		renderers: () => renderers
	});
	const bond = binding.bond.share();
</script>

<Portals id="root">
	<HtmlAtom
		{@attach (node: HTMLElement) => {
			bond.rootElement = node;
		}}
		{base}
		class={cn(
			'atom-root bg-background text-foreground relative flex h-full w-full flex-1 flex-col items-start justify-stretch font-sans',
			'$preset',
			klass
		)}
		{...atomProps}
	>
		{#if portal}
			{@render portal?.()}
			<ActivePortal portal="root.l0">
				{@render children?.()}
			</ActivePortal>
		{:else}
			<PortalHost id="root.l0" class="flex-1 flex flex-col w-full h-full">
				{@render children?.()}
			</PortalHost>
		{/if}
	</HtmlAtom>
</Portals>
