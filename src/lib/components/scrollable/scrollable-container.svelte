<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { ScrollableBond } from './bond.svelte';
	const PART = Kernel.part(ScrollableBond, 'container', { class: '' });
</script>

<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import type { ScrollableContainerProps } from './types';
	import { resizeObserver } from '$ixirjs/ui/attachments/resize-observer.svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import './scrollable-container.css';

	let {
		class: klass = '',
		preset = undefined,
		children,
		...restProps
	}: ScrollableContainerProps<E, B> & BasePropsOf<B> = $props();

	const part = Kernel.node(PART, () => ({ preset }), { context: 'required' });

	// `{@attach}` is markup syntax; the seam takes a props object, so the observer rides its own
	// key. Minted once per instance so it is not torn down and rebuilt on every invalidation.
	const measureKey = createAttachmentKey();

	// Element seam instead of a component boundary; key order matches the previous call exactly.
	const el = Kernel.element(
		{ atom: part.atom, bond: part.bond, preset: part.preset, presetLayer: part.presetLayer },
		() => ({
			[measureKey]: (node: HTMLElement) => {
				if (!part.bond) return;

				return resizeObserver(() => {
					part.bond.props.clientWidth = node.clientWidth;
					part.bond.props.clientHeight = node.clientHeight;
					part.bond.props.scrollWidth = node.scrollWidth;
					part.bond.props.scrollHeight = node.scrollHeight;
				})(node);
			},
			as: 'div',
			class: ['scrollable-container h-full max-h-full w-full overflow-auto', '$preset', klass],
			...restProps
		})
	);
</script>

{@render Kernel.render(el)(el.tag(), el.class(), el.attrs(), children, undefined, el.motion(), el)}
