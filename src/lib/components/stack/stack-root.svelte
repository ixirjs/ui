<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Factory } from '$svelte-atoms/core/types';
	import {
		HtmlAtom,
		type ElementType,
		type HtmlAtomProps,
		type Base
	} from '$svelte-atoms/core/components/atom';
	import { mergeAtomProps } from '$svelte-atoms/core/components/atom';
	import { bindBond } from '$svelte-atoms/core/shared/bond/bind.svelte';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { StackBond, type StackStateProps } from './bond.svelte';
	import './stack.css';

	type Element = ElementType<E>;

	let {
		value = $bindable<string | undefined>(undefined),
		class: klass = '',
		preset = undefined,
		factory = (props: StackStateProps) => StackBond.create(props),
		children,
		...restProps
	}: HtmlAtomProps<E, B> & HTMLAttributes<Element> & { factory?: Factory<StackBond> } = $props();

	let valueState = $derived<string | undefined>(value as string | undefined);

	const binding = bindBond<StackBond>(
		(props) => factory(props),
		{
			value: [
				() => valueState,
				(v) => {
					valueState = v;
					value = valueState;
				}
			]
		},
		{ preset: () => preset }
	);
	const bond = binding.bond.share();
	const rootAtom = createAtomInstance('root', {
		bond,
		factory: (owner) => owner!.root()
	});
	const rootProps = $derived(
		mergeAtomProps(rootAtom, preset, { ...binding.stateProps, ...restProps })
	);

	export function getBond() {
		return bond;
	}
</script>

<HtmlAtom class={['stack-root', '$preset', klass]} {...rootProps}>
	{@render children?.()}
</HtmlAtom>
