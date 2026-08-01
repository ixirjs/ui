<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { bindBond } from '$svelte-atoms/core/shared';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { type Base } from '$svelte-atoms/core/components/atom';
	import { StepBond, StepRootAtom, type StepBondProps } from './bond.svelte';
	import type { StepRootProps } from './types';
	import { onDestroy } from 'svelte';

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

	const binding = bindBond<StepBond>((props) => factory(props), {
		index: () => index,
		disabled: () => disabled,
		completed: () => completed,
		optional: () => optional
	});
	const bond = binding.bond.share();

	createAtomInstance<StepRootAtom, StepBond>('root', {
		bond,
		factory: (owner) => new StepRootAtom(owner as StepBond)
	});

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
