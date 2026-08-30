<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import {
		mergePresetProps,
		type Base,
		type BasePropsOf,
		type HtmlElementTagName
	} from '$ixirjs/ui/authoring';
	import { Divider } from '$ixirjs/ui/components/divider';
	import { cn, toClassValue } from '$ixirjs/ui/utils';
	import type { ListDividerProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		vertical = false,
		// swallowed: a divider has no children slot; kept out of the props spread
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		children = undefined,
		...restProps
	}: ListDividerProps<E, B> & BasePropsOf<B> = $props();

	const dividerProps = $derived(mergePresetProps(preset, 'list.divider', restProps));
</script>

<Divider
	class={cn(!vertical && 'my-1', vertical && 'mx-1', toClassValue(klass, {}))}
	{vertical}
	{...dividerProps}
/>
