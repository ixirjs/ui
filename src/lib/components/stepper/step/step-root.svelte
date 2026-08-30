<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { StepBond, StepContext } from './bond.svelte';
	import type { StepRootProps } from './types';

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
	}: StepRootProps = $props();

	const bondProps = {
		get id() {
			return ID;
		},
		get index() {
			return index;
		},
		get disabled() {
			return disabled;
		},
		get completed() {
			return completed;
		},
		get optional() {
			return optional;
		}
	};
	// `factory` is read once, at init, by design.
	const build = untrack(() => factory);
	const bond = StepContext.share(build ? build(bondProps) : StepBond.create(bondProps));
	// Registered at init — document order — and released on teardown.
	const unmountStep = bond.mount(bond);
	onDestroy(() => unmountStep());
	export const getBond = () => bond;
</script>

{@render children?.({ step: bond })}
