<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { useRoot } from '$ixirjs/ui/shared';
	import { type Base, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
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
		factory = undefined,
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
		{ preset: () => preset, id: () => ID, factory: () => factory }
	);
	const bond: ScrollableBond = root.bond;

	export const getBond = root.getBond;

	const el = Kernel.element(root, () => ({
		as: 'div',
		class: ['scrollable-root relative box-content overflow-hidden', '$preset', klass],
		variantProps: root.props,
		...restProps
	}));
</script>

{@render Kernel.render(el)(el, children, { scrollable: bond })}
