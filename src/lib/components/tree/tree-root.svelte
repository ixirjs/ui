<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { bindBond } from '$svelte-atoms/core/shared/bind-bond.svelte';
	import { bondFactory } from '$svelte-atoms/core/shared';
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { TreeBond, TreeBondState } from './bond.svelte';
	import type { TreeRootProps } from './types';

	let {
		open = $bindable(false),
		disabled = false,
		class: klass = '',
		preset = undefined,
		children = undefined,
		factory = bondFactory(TreeBondState, TreeBond),
		...restProps
	}: TreeRootProps<E, B> = $props();

	const binding = bindBond<TreeBond>(
		(props) => factory(props),
		{
			open: [() => open, (v) => { open = v; }],
			disabled: () => disabled
		},
		{ preset: () => preset }
	);
	const bond = binding.bond.share();


	export function getBond() {
		return bond;
	}
</script>

<HtmlAtom
	class={['flex flex-col', '$preset', klass]}
	{...binding.props}
	{...restProps}
>
	{@render children?.({ tree: bond })}
</HtmlAtom>
