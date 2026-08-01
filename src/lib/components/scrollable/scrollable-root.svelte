<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { bindBond } from '$svelte-atoms/core/shared/bond/bind.svelte';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { mergeAtomProps } from '$svelte-atoms/core/components/atom';
	import { ScrollableBond, type ScrollableRootAtom } from './bond.svelte';
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
		factory = (props) => ScrollableBond.create(props),
		children,
		...restProps
	}: ScrollableRootProps<E, B> = $props();

	let scrollXState = $derived(scrollX);
	let scrollYState = $derived(scrollY);
	let scrollWidthState = $derived(scrollWidth);
	let scrollHeightState = $derived(scrollHeight);
	let clientWidthState = $derived(clientWidth);
	let clientHeightState = $derived(clientHeight);
	let isScrolling = $state(false);

	const binding = bindBond<ScrollableBond>(
		(props) => factory(props),
		{
			scrollX: [
				() => scrollXState,
				(v) => {
					scrollXState = v;
					scrollX = scrollXState;
				}
			],
			scrollY: [
				() => scrollYState,
				(v) => {
					scrollYState = v;
					scrollY = scrollYState;
				}
			],
			scrollWidth: [
				() => scrollWidthState,
				(v) => {
					scrollWidthState = v;
					scrollWidth = scrollWidthState;
				}
			],
			scrollHeight: [
				() => scrollHeightState,
				(v) => {
					scrollHeightState = v;
					scrollHeight = scrollHeightState;
				}
			],
			clientWidth: [
				() => clientWidthState,
				(v) => {
					clientWidthState = v;
					clientWidth = clientWidthState;
				}
			],
			clientHeight: [
				() => clientHeightState,
				(v) => {
					clientHeightState = v;
					clientHeight = clientHeightState;
				}
			],
			disabled: () => disabled,
			open: [() => open, (v) => (open = v)],
			isScrolling: [() => isScrolling, (v) => (isScrolling = v ?? false)]
		},
		{ preset: () => preset }
	);
	const bond: ScrollableBond = binding.bond.share();
	const rootAtom = createAtomInstance<ScrollableRootAtom, ScrollableBond, HTMLElement>('root', {
		bond,
		factory: (owner) => owner!.root() as ScrollableRootAtom
	});
	const rootProps = $derived(
		mergeAtomProps(rootAtom, preset, { ...binding.stateProps, ...restProps })
	);

	export function getBond(): ScrollableBond {
		return bond;
	}
</script>

<HtmlAtom
	as="div"
	class={['scrollable-root relative box-content overflow-hidden', '$preset', klass]}
	{...rootProps}
>
	{@render children?.({ scrollable: bond })}
</HtmlAtom>
