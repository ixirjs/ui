<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import type { ScrollableContainerProps } from './types';
	import { ScrollableBond } from './bond.svelte';
	import { resizeObserver } from '$ixirjs/ui/attachments/resize-observer.svelte';
	import { usePart } from '$ixirjs/ui/shared';
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import './scrollable-container.css';

	let {
		class: klass = '',
		preset = undefined,
		children,
		...restProps
	}: ScrollableContainerProps<E, B> = $props();

	const part = usePart(ScrollableBond, 'container', () => restProps, {
		preset: () => preset
	});
</script>

<HtmlAtom
	{@attach (node: HTMLElement) => {
		if (!part.bond) return;

		return resizeObserver(() => {
			part.bond.props.clientWidth = node.clientWidth;
			part.bond.props.clientHeight = node.clientHeight;
			part.bond.props.scrollWidth = node.scrollWidth;
			part.bond.props.scrollHeight = node.scrollHeight;
		})(node);
	}}
	as="div"
	class={['scrollable-container h-full max-h-full w-full overflow-auto', '$preset', klass]}
	{...restProps}
	{part}
>
	{@render children?.()}
</HtmlAtom>
