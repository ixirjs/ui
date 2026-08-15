<script lang="ts" generics="E extends HtmlElementTagName = 'ul', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { mergePresetProps, type Base, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import type { ListRootProps } from './types';

	let {
		class: klass = '',
		as = 'ul' as E,
		preset = undefined,
		children = undefined,
		...restProps
	}: ListRootProps<E, B> = $props();

	const rootProps = $derived(mergePresetProps(preset, 'list.root', restProps));

	// Element seam instead of a component boundary: identical output, one less boundary. Key
	// order below is the order the previous call had; precedence is object-literal order.
	const el = Kernel.element(Kernel.static, () => ({
		as,
		class: ['flex flex-col', '$preset', klass],
		...rootProps
	}));
</script>

{@render Kernel.render(el)(el.tag(), el.class(), el.attrs(), children, undefined, el.motion(), el)}
