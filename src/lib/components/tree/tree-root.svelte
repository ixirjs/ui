<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { controlledProp, useRoot } from '$ixirjs/ui/shared';
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
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
		factory = undefined,
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
			factory: () => factory
		}
	);
	const bond: TreeBond = root.bond;

	export function getBond(): TreeBond {
		return bond;
	}

	const el = usePartElement(root, () => ({
		class: ['flex flex-col', '$preset', klass],
		...root.props,
		...restProps
	}));
</script>

{#snippet body()}
	{@render children?.({ tree: bond })}
{/snippet}

{@render partElement(el, body)}
