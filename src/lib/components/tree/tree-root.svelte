<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { controlledProp, useRoot } from '$ixirjs/ui/shared';
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { TreeBond } from './bond.svelte';
	import type { TreeRootProps } from './types';

	const ID = $props.id();

	let {
		open = $bindable(false),
		disabled = false,
		class: klass = '',
		preset = undefined,
		presets = undefined,
		children = undefined,
		factory = (props) => TreeBond.create(props),
		onopenchange = undefined,
		...restProps
	}: TreeRootProps<E, B> = $props();

	const openProp = controlledProp<boolean, TreeBond>({
		get: () => open,
		set: (value) => (open = value),
		onchange: (value, context) => onopenchange?.(value, context),
		context: (bond) => bond.takeOpenChangeContext()
	});

	const root = useRoot(
		TreeBond,
		{
			open: openProp,
			disabled: () => disabled,
			presets: () => presets
		},
		{
			preset: () => preset,
			id: () => ID,
			factory: (props) => factory(props)
		}
	);
	const bond: TreeBond = root.bond;

	export function getBond(): TreeBond {
		return bond;
	}
</script>

<HtmlAtom class={['flex flex-col', '$preset', klass]} {...root.props} {...restProps} part={root}>
	{@render children?.({ tree: bond })}
</HtmlAtom>
