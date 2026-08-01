<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergePresetProps, HtmlAtom, type HtmlAtomProps, type Base } from '$svelte-atoms/core/components/atom';

	let { class: klass = '', preset = undefined, children, ...restProps }: HtmlAtomProps<E, B> = $props();

	const linkProps = $derived(mergePresetProps(preset, 'link', restProps));
</script>

<HtmlAtom
	class={[
		'hover:text-primary/80 active:text-primary cursor-pointer underline transition-colors duration-200',
		'$preset',
		klass
	]}
	as="a"
	{...linkProps}
>
	{@render children?.()}
</HtmlAtom>
