<script lang="ts">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { ScrollableBond, ScrollableContext } from './bond.svelte';
	import type { ScrollableRootProps } from './types';

	const ID = $props.id();

	let {
		scrollX = $bindable(0),
		scrollY = $bindable(0),
		scrollWidth = $bindable(0),
		scrollHeight = $bindable(0),
		clientWidth = $bindable(0),
		clientHeight = $bindable(0),
		as = undefined,
		base = undefined,
		disabled = false,
		open = true,
		factory = undefined,
		children,
		...restProps
	}: ScrollableRootProps = $props();

	let isScrolling = $state(false);

	// Live props: the Bond measures and drags through these setters, so every `bind:` round-trips.
	const bondProps = {
		get id() {
			return ID;
		},
		get scrollX() {
			return scrollX;
		},
		set scrollX(v: number) {
			scrollX = v;
		},
		get scrollY() {
			return scrollY;
		},
		set scrollY(v: number) {
			scrollY = v;
		},
		get scrollWidth() {
			return scrollWidth;
		},
		set scrollWidth(v: number) {
			scrollWidth = v;
		},
		get scrollHeight() {
			return scrollHeight;
		},
		set scrollHeight(v: number) {
			scrollHeight = v;
		},
		get clientWidth() {
			return clientWidth;
		},
		set clientWidth(v: number) {
			clientWidth = v;
		},
		get clientHeight() {
			return clientHeight;
		},
		set clientHeight(v: number) {
			clientHeight = v;
		},
		get disabled() {
			return disabled;
		},
		get open() {
			return open;
		},
		set open(v: boolean) {
			open = v;
		},
		get isScrolling() {
			return isScrolling;
		},
		set isScrolling(v: boolean | undefined) {
			isScrolling = v ?? false;
		}
	};
	// `factory` is read once, at init, by design.
	const build = untrack(() => factory);
	const bond: ScrollableBond = ScrollableContext.share(
		build ? build(bondProps) : ScrollableBond.create(bondProps)
	);
	export const getBond = () => bond;

	const el = Kernel.element(() => restProps, {
		preset: 'scrollable',
		class: 'scrollable-root relative box-content overflow-hidden',
		state: bond,
		variantProps: () => bondProps,
		as: () => as,
		base: () => base,
		attrs: () => ({
			id: bond.partId('root'),
			'data-disabled': bond.props.disabled,
			'data-open': bond.props.open
		})
	});
	// Bound once: an identifier callee compiles to a direct call — no snippet block, no anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children, { scrollable: bond })}
