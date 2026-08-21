<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { CollapsibleBond } from './bond.svelte';
	const PART = Kernel.plan(CollapsibleBond, 'indicator', { class: '' });
</script>

<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { animate as runAnimation } from '$ixirjs/ui/shared';
	import { Icon } from '$ixirjs/ui/components/icon';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import IconArrowDown from '$ixirjs/ui/icons/icon-arrow-down.svelte';
	import type { CollapsibleIndicatorProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		animate = defaultAnimate,
		children = undefined,
		...restProps
	}: CollapsibleIndicatorProps<E, B> & BasePropsOf<B> = $props();
	const part = Kernel.node(PART, () => ({ preset }), { context: 'required' });
	const isOpen = $derived(part.bond.isOpen);

	function defaultAnimate(node: HTMLElement) {
		runAnimation(node, { rotate: 180 * +isOpen }, { duration: 0.3, ease: 'anticipate' });
	}

	// Driver-only motion routes straight to HtmlElement.
	const bodyArg = { collapsible: part.bond };
	const el = Kernel.element(
		{ atom: part.atom, bond: part.bond, preset: part.preset, presetLayer: part.presetLayer },
		() => ({
			animate,
			class: ['border-border flex size-4 items-center justify-center', '$preset', klass],
			...restProps
		})
	);
</script>

{@render Kernel.render(el)(el, children ?? fallback, bodyArg)}

{#snippet fallback()}
	<Icon src={IconArrowDown} />
{/snippet}
