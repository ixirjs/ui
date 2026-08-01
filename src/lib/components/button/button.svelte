<script lang="ts">
	import type { ButtonProps } from './types';
	import { mergePresetProps, HtmlAtom } from '$ixirjs/ui/components/atom';

	let {
		class: klass = '',
		type = 'button',
		preset = undefined,
		children = undefined,
		...restProps
	}: ButtonProps = $props();

	// Keep the rest-props proxy intact: HtmlAtom receives `type` separately, after this spread,
	// so the semantic default and explicit caller value both win over preset attributes.
	const buttonProps = $derived(mergePresetProps(preset, 'button', restProps));
</script>

<HtmlAtom
	as="button"
	class={[
		'button text-primary-foreground bg-primary border-border hover:bg-primary/95 active:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground w-fit cursor-pointer rounded-md px-3 py-2 transition-colors duration-200',
		'$preset',
		klass
	]}
	{...buttonProps}
	{type}
>
	{@render children?.()}
</HtmlAtom>
