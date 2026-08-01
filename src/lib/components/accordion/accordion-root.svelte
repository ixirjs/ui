<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, mergeAtomProps, type Base } from '$svelte-atoms/core/components/atom';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { AccordionBond, AccordionRootAtom, type AccordionBondProps } from './bond.svelte';
	import type { AccordionRootProps } from './types';
	import { bindBond } from '$svelte-atoms/core/shared/bond/bind.svelte';

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

	let valueState = $derived<string | undefined>(value);
	let valuesState = $derived<string[]>(values);

	const binding = bindBond<AccordionBond>(
		(props) => factory(props),
		{
			open: () => (multiple ? valuesState.length > 0 : valueState !== undefined),
			values: [
				() => (multiple ? valuesState : ([valueState].filter(Boolean) as string[])),
				(v) => {
					valuesState = v;
					valueState = valuesState[0];
					values = valuesState;
					value = valueState;
				}
			],
			multiple: () => multiple,
			collapsible: () => collapsible,
			disabled: () => disabled
		},
		{ preset: () => preset }
	);
	const bond = binding.bond.share();
	const rootAtom = createAtomInstance<AccordionRootAtom, AccordionBond>('root', {
		bond,
		factory: (owner) => new AccordionRootAtom(owner as AccordionBond)
	});
	const rootProps = $derived(
		mergeAtomProps(rootAtom, preset, { ...binding.stateProps, ...restProps })
	);

	function defaultFactory(props: AccordionBondProps) {
		return AccordionBond.create(props);
	}

	export function getBond() {
		return bond;
	}
</script>

<HtmlAtom
	class={['bg-card border-border flex list-none flex-col', '$preset', klass]}
	{...rootProps}
>
	{@render children?.({ accordion: bond })}
</HtmlAtom>
