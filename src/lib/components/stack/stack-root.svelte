<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import type { HTMLAttributes } from 'svelte/elements';
	import { bondFactory } from '$svelte-atoms/core/shared';
	import type { Factory } from '$svelte-atoms/core/types';
	import {
		HtmlAtom,
		type ElementType,
		type HtmlAtomProps,
		type Base
	} from '$svelte-atoms/core/components/atom';
	import { bindBond } from '$svelte-atoms/core/shared/bind-bond.svelte';
	import { StackBond, StackState } from './bond.svelte';
	import './stack.css';

	type Element = ElementType<E>;

	let {
		value = $bindable<string | undefined>(undefined),
		class: klass = '',
		preset = undefined,
		factory = bondFactory(StackState, StackBond),
		children,
		...restProps
	}: HtmlAtomProps<E, B> & HTMLAttributes<Element> & { factory?: Factory<StackBond> } = $props();

	const binding = bindBond<StackBond>(
		(props) => factory(props),
		{
			value: [() => value as string | undefined, (v) => { value = v; }]
		},
		{ preset: () => preset }
	);
	const bond = binding.bond.share();


	export function getBond() {
		return bond;
	}
</script>

<HtmlAtom
	class={['stack-root', '$preset', klass]}
	{...binding.props}
	{...restProps}
>
	{@render children?.()}
</HtmlAtom>
