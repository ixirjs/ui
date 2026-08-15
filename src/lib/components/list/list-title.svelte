<script lang="ts" generics="E extends HtmlElementTagName = 'h3', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import {
		mergePresetProps,
		type Base,
		type BasePropsOf,
		type HtmlElementTagName
	} from '$ixirjs/ui/components/atom';
	import type { ListTitleProps } from './types';

	let {
		class: klass = '',
		as = 'h3' as E,
		preset = undefined,
		children = undefined,
		...restProps
	}: ListTitleProps<E, B> & BasePropsOf<B> = $props();

	const titleProps = $derived(mergePresetProps(preset, 'list.title', restProps));

	// Element seam instead of a component boundary: identical output, one less boundary. Key
	// order below is the order the previous call had; precedence is object-literal order.
	const el = Kernel.element(Kernel.static, () => ({
		as,
		class: ['mb-1 flex w-full px-6 py-1 font-medium', '$preset', klass],
		...titleProps
	}));
</script>

{@render Kernel.render(el)(el.tag(), el.class(), el.attrs(), children, undefined, el.motion(), el)}
