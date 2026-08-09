<script
	lang="ts"
	generics="Src extends Component = Component, E extends HtmlElementTagName = 'div', B extends Base = Base"
>
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import type { Component } from 'svelte';
	import { mergePresetProps, type Base, type BasePropsOf } from '$ixirjs/ui/components/atom';
	import type {
		HtmlElementTagName,
		HtmlElementType,
		HtmlElementAttributes
	} from '$ixirjs/ui/components/element';
	import type { IconProps } from './types';
	import './icon.css';

	type Element = HtmlElementType<'div'>;

	let {
		class: klass = '',
		src = undefined,
		preset = undefined,
		children = undefined,
		...restProps
	}: IconProps<Src, E, B> & HtmlElementAttributes<Element> & BasePropsOf<B> = $props();

	const iconProps = $derived(mergePresetProps(preset, 'icon', restProps));

	const content = $derived(src ? sourceSnippet : children);

	// Element seam instead of a component boundary: identical output, one less boundary. Key
	// order below is the order the previous call had; precedence is object-literal order.
	const el = Kernel.element(Kernel.static, () => ({
		class: [
			'ixir-icon inline-flex aspect-square h-6 items-center justify-center leading-none text-current',
			'$preset',
			klass
		],
		...iconProps
	}));
</script>

{@render Kernel.render(el)(el.tag(), el.class(), el.attrs(), content, undefined, el.motion(), el)}

{#snippet sourceSnippet()}
	{@const Src = src}
	<Src />
{/snippet}
