<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import {
		mergePresetProps,
		type Base,
		type BasePropsOf,
		type HtmlElementTagName
	} from '$ixirjs/ui/components/atom';
	import { toClassValue } from '$ixirjs/ui/utils';
	import type { ListGroupProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: ListGroupProps<E, B> & BasePropsOf<B> = $props();

	const groupProps = $derived(mergePresetProps(preset, 'list.group', restProps));

	// Element seam instead of a component boundary: identical output, one less boundary. Key
	// order below is the order the previous call had; precedence is object-literal order.
	const el = Kernel.element(Kernel.static, () => ({
		class: [
			'rounded-b-inherit rounded-t-inherit border-border flex flex-col',
			'$preset',
			toClassValue(klass, {})
		],
		...groupProps
	}));
</script>

{@render Kernel.render(el)(el, children)}
