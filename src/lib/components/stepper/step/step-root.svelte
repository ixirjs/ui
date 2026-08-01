<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { useRoot } from '$ixirjs/ui/shared';
	import { type Base } from '$ixirjs/ui/components/atom';
	import { StepBond, type StepBondProps } from './bond.svelte';
	import type { StepRootProps } from './types';
	import { onDestroy } from 'svelte';

	const ID = $props.id();

	// Step.Root is renderless (registration-only — it renders `children`, not an element), so there is
	// no host element to forward the inherited HtmlAtomProps (class/preset/…) onto; they're intentionally unused.
	// eslint-disable-next-line svelte/no-unused-props
	let {
		index,
		disabled = false,
		completed = false,
		optional = false,
		children = undefined,
		factory = defaultFactory
	}: StepRootProps<E, B> = $props();

	const bond = useRoot(
		StepBond,
		{
			index: () => index,
			disabled: () => disabled,
			completed: () => completed,
			optional: () => optional
		},
		{ id: () => ID, factory: (props) => factory(props) }
	).bond;

	const unmountStep = bond.mount(bond);

	onDestroy(() => {
		unmountStep?.();
	});

	function defaultFactory(props: StepBondProps) {
		return StepBond.create(props);
	}

	export function getBond() {
		return bond;
	}
</script>

{@render children?.({ step: bond })}
