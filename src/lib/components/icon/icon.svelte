<script
	lang="ts"
	generics="Src extends Component = Component, E extends HtmlElementTagName = 'div', B extends Base = Base"
>
	import type { Component } from 'svelte';
	import { mergePresetProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import type {
		HtmlElementTagName,
		HtmlElementType,
		HtmlElementAttributes
	} from '$svelte-atoms/core/components/element';
	import type { IconProps } from './types';
	import './icon.css';

	type Element = HtmlElementType<'div'>;

	let {
		class: klass = '',
		src = undefined,
		preset = undefined,
		children = undefined,
		...restProps
	}: IconProps<Src, E, B> & HtmlElementAttributes<Element> = $props();

	const iconProps = $derived(mergePresetProps(preset, 'icon', restProps));

	const content = $derived(src ? sourceSnippet : children);
</script>

{#snippet sourceSnippet()}
	{@const Src = src}
	<Src />
{/snippet}

<HtmlAtom
	class={[
		'icon inline-flex aspect-square h-6 items-center justify-center leading-none text-current',
		'$preset',
		klass
	]}
	{...iconProps}
>
	{@render content?.()}
</HtmlAtom>
