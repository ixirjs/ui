<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergePresetProps, HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { toClassValue } from '$ixirjs/ui/utils';
	import type { ListGroupProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: ListGroupProps<E, B> = $props();

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
