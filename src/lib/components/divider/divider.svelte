<script>
	import { mergePresetProps, HtmlAtom } from '$ixirjs/ui/components/atom';

	let {
		class: klass = '',
		preset = undefined,
		as = 'div',
		vertical = false,
		transparent = false,
		...restProps
	} = $props();

	const dividerProps = $derived(mergePresetProps(preset, 'divider', restProps));
</script>

<HtmlAtom
	{as}
	class={[
		'atoms-ui divider border-border',
		transparent && 'bg-transparent',
		!vertical && 'my-6 w-full border-b',
		vertical && 'mx-6 h-full border-r',
		!vertical && 'mx-0',
		vertical && 'my-0',
		'$preset',
		klass
	]}
	{...dividerProps}
></HtmlAtom>
