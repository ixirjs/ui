<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { useRoot } from '$ixirjs/ui/shared';
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { ScrollableBond } from './bond.svelte';
	import type { ScrollableRootProps } from './types';

	const ID = $props.id();

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

	const root = useRoot(
		ScrollableBond,
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
		{ preset: () => preset, id: () => ID, factory: (props) => factory(props) }
	);
	const bond: ScrollableBond = root.bond;

	export function getBond(): ScrollableBond {
		return bond;
	}
</script>

<HtmlAtom
	as="div"
	class={['scrollable-root relative box-content overflow-hidden', '$preset', klass]}
	{...root.props}
	{...restProps}
	part={root}
>
	{@render children?.({ scrollable: bond })}
</HtmlAtom>
