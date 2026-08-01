<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { bindBond } from '$svelte-atoms/core/shared/bind-bond.svelte';
	import { type Base } from '$svelte-atoms/core/components/atom';
	import { StepBond, StepBondState, type StepBondProps } from './bond.svelte';
	import type { StepRootProps } from './types';
	import type { Factory } from '$svelte-atoms/core/types';
	import { onDestroy } from 'svelte';

	let {
		index,
		disabled = false,
		completed = false,
		optional = false,
		children = undefined,
		factory = defaultFactory as Factory<StepBond>,
	}: StepRootProps<E, B> = $props();

	const binding = bindBond<StepBond>(
		(props) => factory(props),
		{
			index: () => index,
			disabled: () => disabled,
			completed: () => completed,
			optional: () => optional
		}
	);
	const bond = binding.bond.share();

	bond.state.mount();
	
	onDestroy(()=> {
		bond.state.unmount();
	});

	function defaultFactory(props: StepBondProps) {
		const stepState = new StepBondState(props);
		return new StepBond(stepState);
	}

	export function getBond() {
		return bond;
	}
</script>

{@render children?.({ step: bond })}
