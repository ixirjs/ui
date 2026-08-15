<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { useRoot } from '$ixirjs/ui/shared';
	import { type Base, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { StepBond } from './bond.svelte';
	import type { StepRootProps } from './types';
	import { onDestroy } from 'svelte';

	const ID = $props.id();

	// Step.Root is renderless (registration-only — it renders `children`, not an element), so there is
	// no host element to forward the inherited RenderProps (class/preset/…) onto; they're intentionally unused.
	// eslint-disable-next-line svelte/no-unused-props
	let {
		index,
		disabled = false,
		completed = false,
		optional = false,
		children = undefined,
		factory = undefined
	}: StepRootProps<E, B> = $props();

	const bond = useRoot(
		StepBond,
		{
			index: () => index,
			disabled: () => disabled,
			completed: () => completed,
			optional: () => optional
		},
		// Renderless: Step.Root owns the Bond and renders `children` only, so it declares no root
		// Atom. It previously created one whose attrs — role="group", the label linkage, the status
		// data attributes — had no element to land on and were never emitted.
		{ id: () => ID, factory: () => factory, atom: false }
	).bond;

	const unmountStep = bond.mount(bond);

	onDestroy(() => {
		unmountStep?.();
	});

	export const getBond = () => bond;
</script>

{@render children?.({ step: bond })}
