<script lang="ts">
	import { mergePresetProps, HtmlAtom } from '$svelte-atoms/core/components/atom';
	import { toClassValue } from '$svelte-atoms/core/utils';

	let { class: klass = '', preset = undefined, children = undefined, ...restProps } = $props();

	const groupProps = $derived(mergePresetProps(preset, 'list.group', restProps));
</script>

<HtmlAtom
	class={[
		'rounded-b-inherit rounded-t-inherit border-border flex flex-col',
		'$preset',
		toClassValue(klass, {})
	]}
	{...groupProps}
>
	{@render children?.()}
</HtmlAtom>
