<script module lang="ts">
	export type RootPortals = 'root.l0';
</script>

<script lang="ts">
	import { cn, defineState, defineProperty } from '$svelte-atoms/core/utils';
	import { bindBond } from '$svelte-atoms/core/shared/bind-bond.svelte';
	import { bondFactory } from '$svelte-atoms/core/shared';
	import { ActivePortal, Portal, Portals } from '$svelte-atoms/core/components/portal';
	import { mergePresetProps, HtmlAtom as Atom } from '$svelte-atoms/core/components/atom';
	import { HtmlElement, SvgElement } from '$svelte-atoms/core/components/element';
	import { RootBond, RootBondState } from './bond.svelte';
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

	const binding = bindBond<RootBond>(
		bondFactory(RootBondState, RootBond),
		{ renderers: () => renderers }
	);
	const bond = binding.bond.share();
</script>

<Portals id="root">
	<Atom
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
		{:else}
			<!-- Absolute surface over the root atom; the soft containment boundary for overlays. -->
			<Portal.Outer id="root.l0">
				<Portal.Inner />
			</Portal.Outer>
		{/if}

		<ActivePortal portal="root.l0">
			{@render children?.()}
		</ActivePortal>
	</Atom>
</Portals>
