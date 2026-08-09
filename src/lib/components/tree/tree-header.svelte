<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { TreeBond } from './bond.svelte';
	const PART = Kernel.part(TreeBond, 'header', { class: '' });
</script>

<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
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
	}: TreeHeaderProps<E, B> & BasePropsOf<B> = $props();

	type PointerHandlerEvent = Parameters<NonNullable<typeof onpointerdown>>[0];
	type KeyHandlerEvent = Parameters<NonNullable<typeof onkeydown>>[0];

	const part = Kernel.node(PART, () => ({ preset }), { context: 'required' });

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

	const el = Kernel.element(part, () => ({
		class: ['cursor-pointer', '$preset', klass],
		...restProps,
		onpointerdown: handlePointerDown,
		onkeydown: handleKeydown
	}));
</script>

{@render Kernel.render(el)(
	el.tag(),
	el.class(),
	el.attrs(),
	children,
	{ tree: part.bond },
	el.motion(),
	el
)}
