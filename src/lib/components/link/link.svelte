<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import {
		mergePresetProps,
		type RenderProps,
		type Base,
		type BasePropsOf,
		type HtmlElementTagName
	} from '$ixirjs/ui/components/atom';

	let {
		class: klass = '',
		preset = undefined,
		children,
		...restProps
	}: RenderProps<E, B> & BasePropsOf<B> = $props();

	const linkProps = $derived(mergePresetProps(preset, 'link', restProps));

	// Element seam instead of a component boundary: identical output, one less boundary. Key
	// order below is the order the previous call had; precedence is object-literal order.
	const el = Kernel.element(Kernel.static, () => ({
		class: [
			'hover:text-primary/80 active:text-primary cursor-pointer underline transition-colors duration-200',
			'$preset',
			klass
		],
		as: 'a',
		...linkProps
	}));
</script>

{@render Kernel.render(el)(el.tag(), el.class(), el.attrs(), children, undefined, el.motion(), el)}
