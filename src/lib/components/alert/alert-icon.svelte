<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { AlertBond } from './bond.svelte';
	const PART = Kernel.part(AlertBond, 'icon', { class: '' });
</script>

<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Icon } from '$ixirjs/ui/components/icon';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import type { AlertIconProps } from './types';

	let {
		class: klass = '',
		base = Icon as unknown as B,
		preset = undefined,
		children = undefined,
		...restProps
	}: AlertIconProps<E, B> & BasePropsOf<B> = $props();

	const part = Kernel.node(PART, () => ({ preset }), { context: 'optional' });
	const bond = part.bond;

	// `base` defaults to Icon; `base={null}` deliberately selects a native element leaf.
	const el = Kernel.element(
		{ atom: part.atom, bond, preset: part.preset, presetLayer: part.presetLayer },
		() => ({
			base,
			class: [
				'alert-icon border-border inline-flex aspect-square h-5 items-center justify-center rounded-full text-sm font-medium',
				'$preset',
				klass
			],
			...restProps
		})
	);
</script>

{@render Kernel.render(el)(
	el.tag(),
	el.class(),
	el.attrs(),
	children,
	{ alert: bond! },
	el.motion(),
	el
)}
