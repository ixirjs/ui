<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import type { ScrollableContainerProps } from './types';
	import { ScrollableBond } from './bond.svelte';
	import { resizeObserver } from '$svelte-atoms/core/attachments/resize-observer.svelte';
	import { mergeAtomProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import './scrollable-container.css';

	let {
		class: klass = '',
		preset = undefined,
		children,
		...restProps
	}: ScrollableContainerProps<E, B> = $props();

	const bond = ScrollableBond.getOrThrow('ScrollableContainer must be used within a ScrollableRoot');

	const atom = bond.atom('container');

	const containerProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<HtmlAtom
	{@attach (node: HTMLElement) => {
		if (!bond) return;

		return resizeObserver(() => {
			bond.state.props.clientWidth = node.clientWidth;
			bond.state.props.clientHeight = node.clientHeight;
			bond.state.props.scrollWidth = node.scrollWidth;
			bond.state.props.scrollHeight = node.scrollHeight;
		})(node);
	}}
	{bond}
	as="div"
	class={[
		'scrollable-container border-border h-full max-h-full w-full overflow-auto',
		'$preset',
		klass
	]}
	{...containerProps}
>
	{#if children}
		{@render children()}
	{/if}
</HtmlAtom>
