<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { bindBond } from '$svelte-atoms/core/shared/bond/bind.svelte';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { mergeAtomProps } from '$svelte-atoms/core/components/atom';
	import { TreeBond, type TreeRootAtom } from './bond.svelte';
	import type { TreeRootProps } from './types';

	let {
		open = $bindable(false),
		disabled = false,
		class: klass = '',
		preset = undefined,
		children = undefined,
		factory = (props) => TreeBond.create(props),
		...restProps
	}: TreeRootProps<E, B> = $props();

	let openState = $derived(open);

	const binding = bindBond<TreeBond>(
		(props) => factory(props),
		{
			open: [
				() => openState,
				(v) => {
					openState = v;
					open = openState;
				}
			],
			disabled: () => disabled
		},
		{ preset: () => preset }
	);
	const bond: TreeBond = binding.bond.share();
	const rootAtom = createAtomInstance<TreeRootAtom, TreeBond, HTMLElement>('root', {
		bond,
		factory: (owner) => owner!.root() as TreeRootAtom
	});
	const rootProps = $derived(
		mergeAtomProps(rootAtom, preset, { ...binding.stateProps, ...restProps })
	);

	export function getBond(): TreeBond {
		return bond;
	}
</script>

<HtmlAtom class={['flex flex-col', '$preset', klass]} {...rootProps}>
	{@render children?.({ tree: bond })}
</HtmlAtom>
