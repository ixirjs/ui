<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { AccordionBond, AccordionState, type AccordionStateProps } from './bond.svelte';
	import type { AccordionRootProps } from './types';
	import { bindBond } from '$svelte-atoms/core/shared/bind-bond.svelte';

	let {
		value = $bindable(undefined),
		values = $bindable([]),
		data = $bindable([]),
		class: klass = '',
		multiple = false,
		collapsible = false,
		disabled = false,
		children = undefined,
		factory = defaultFactory,
		preset = undefined,
		...restProps
	}: AccordionRootProps<E, B> = $props();

	const binding = bindBond<AccordionBond>(
		(props) => factory(props),
		{
			values: [
				() => (multiple ? values : ([value].filter(Boolean) as string[])),
				(v) => {
					values = v;
					value = values[0];
				}
			],
			multiple: () => multiple,
			collapsible: () => collapsible,
			disabled: () => disabled,
			rest: () => restProps
		},
		{ preset: () => preset }
	);
	const bond = binding.bond.share();

	function defaultFactory(props: AccordionStateProps) {
		const bondState = new AccordionState(props);
		return new AccordionBond(bondState);
	}

	export function getBond() {
		return bond;
	}
</script>

<HtmlAtom
	class={['bg-card border-border flex list-none flex-col', '$preset', klass]}
	{...binding.props}
	{...restProps}
>
	{@render children?.({ accordion: bond })}
</HtmlAtom>
