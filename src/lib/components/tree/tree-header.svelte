<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
	import { usePart } from '$ixirjs/ui/shared';
	import { TreeBond } from './bond.svelte';
	import type { TreeHeaderProps } from './types';

	// `& HTMLAttributes<…>` used to be needed here because `ElementProps` carried no DOM attributes.
	// It does now, and intersecting a second source of `onpointerdown` only makes the handler type
	// ambiguous, so the props type stands alone.
	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		onpointerdown = undefined,
		onkeydown = undefined,
		...restProps
	}: TreeHeaderProps<E, B> = $props();

	type PointerHandlerEvent = Parameters<NonNullable<typeof onpointerdown>>[0];
	type KeyHandlerEvent = Parameters<NonNullable<typeof onkeydown>>[0];

	const part = usePart(TreeBond, 'header', () => restProps, {
		preset: () => preset
	});

	// These run before the atom's own disclosure handler and stage the reason for it. The seam
	// composes the two — consumer handler first, then the atom's, skipped when default is prevented
	// — so neither needs to invoke the atom handler by hand.
	function handlePointerDown(event: PointerHandlerEvent) {
		onpointerdown?.(event);
		if (event.defaultPrevented) return;
		part.bond.stageOpenChange({ event, reason: 'trigger' });
	}

	function handleKeydown(event: KeyHandlerEvent) {
		onkeydown?.(event);
		if (event.defaultPrevented) return;
		if (event.key === 'Enter' || event.key === ' ') {
			part.bond.stageOpenChange({ event, reason: 'trigger' });
		}
	}

	const el = usePartElement(part, () => ({
		class: ['cursor-pointer', '$preset', klass],
		...restProps,
		onpointerdown: handlePointerDown,
		onkeydown: handleKeydown
	}));
</script>

{@render partElement(el, children, { tree: part.bond })}
