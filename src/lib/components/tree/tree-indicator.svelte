<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { animate as runAnimation, usePart } from '$ixirjs/ui/shared';
	import { stopMotion } from '$ixirjs/ui/components/element/motion-host';
	import { TreeBond } from './bond.svelte';
	import type { TreeIndicatorProps } from './types';

	let {
		open = $bindable(false),
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: TreeIndicatorProps<E, B> = $props();

	const part = usePart(TreeBond, 'indicator', () => restProps, {
		preset: () => preset
	});
	const isOpen = $derived(part.bond.isOpen);

	// An attachment rather than a `defaults` motion phase — see `attachTreeBodyMotion`. There is no
	// `initial` phase here, so the rotation simply runs on mount and again on every toggle, exactly
	// as the adapter drove it.
	function motion(node: HTMLElement) {
		const controller = runAnimation(
			node,
			{ rotate: 90 * +isOpen },
			{ duration: 0.18, ease: 'circOut' }
		);
		return () => stopMotion(controller, node);
	}
</script>

<HtmlAtom class={['aspect-square h-fit', '$preset', klass]} {@attach motion} {...restProps} {part}>
	{@render children?.({ tree: part.bond })}
</HtmlAtom>
