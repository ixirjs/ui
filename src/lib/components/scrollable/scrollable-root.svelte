<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { bindBond } from '$svelte-atoms/core/shared/bind-bond.svelte';
	import { bondFactory } from '$svelte-atoms/core/shared';
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { ScrollableBond, ScrollableState } from './bond.svelte';
	import type { ScrollableRootProps } from './types';
	
	let {
		scrollX = $bindable(0),
		scrollY = $bindable(0),
		scrollWidth = $bindable(0),
		scrollHeight = $bindable(0),
		clientWidth = $bindable(0),
		clientHeight = $bindable(0),
		class: klass = '',
		preset = undefined,
		disabled = false,
		open = true,
		factory = bondFactory(ScrollableState, ScrollableBond),
		children,
		...restProps
	}: ScrollableRootProps<E, B> = $props();

	let isScrolling = $state(false);

	const binding = bindBond<ScrollableBond>(
		(props) => factory(props),
		{
			scrollX: [() => scrollX, (v) => (scrollX = v)],
			scrollY: [() => scrollY, (v) => (scrollY = v)],
			scrollWidth: [() => scrollWidth, (v) => (scrollWidth = v)],
			scrollHeight: [() => scrollHeight, (v) => (scrollHeight = v)],
			clientWidth: [() => clientWidth, (v) => (clientWidth = v)],
			clientHeight: [() => clientHeight, (v) => (clientHeight = v)],
			disabled: () => disabled,
			open: [() => open, (v) => (open = v)],
			isScrolling: [() => isScrolling, (v) => (isScrolling = v ?? false)]
		},
		{ preset: () => preset }
	);
	const bond = binding.bond.share();


	export function getBond() {
		return bond;
	}
</script>

<HtmlAtom
	as="div"
	class={['scrollable-root border-border relative box-content overflow-hidden', '$preset', klass]}
	{...binding.props}
	{...restProps}
>
	{@render children?.({ scrollable: bond })}
</HtmlAtom>
