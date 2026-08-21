<script lang="ts" generics="E extends HtmlElementTagName = 'label', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import {
		mergePresetProps,
		type Base,
		type BasePropsOf,
		type HtmlElementTagName
	} from '$ixirjs/ui/components/atom';
	import type { LabelProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		as = 'label' as E,
		for: labelfor = null,
		children,
		...restProps
	}: LabelProps<E, B> & BasePropsOf<B> = $props();

	const labelProps = $derived(mergePresetProps(preset, 'label', restProps));

	// Element seam instead of a component boundary: identical output, one less boundary. Key
	// order below is the order the previous call had; precedence is object-literal order.
	const el = Kernel.element(Kernel.static, () => ({
		as,
		class: ['font-medium', '$preset', klass],
		for: labelfor,
		...labelProps
	}));
</script>

{@render Kernel.render(el)(el, children, {})}
