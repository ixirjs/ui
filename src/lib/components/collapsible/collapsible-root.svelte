<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { bindBond } from '$svelte-atoms/core/shared/bond/bind.svelte';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { HtmlAtom, mergeAtomProps, type Base } from '$svelte-atoms/core/components/atom';
	import { CollapsibleBond, CollapsibleRootAtom, type CollapsibleStateProps } from './bond.svelte';
	import type { CollapsibleRootProps } from './types';

	let {
		open = $bindable(false),
		class: klass = '',
		preset = undefined,
		value,
		data = undefined,
		disabled = false,
		factory = defaultFactory,
		children = undefined,
		...restProps
	}: CollapsibleRootProps<E, B> = $props();

	let openState = $derived(open);

	const binding = bindBond<CollapsibleBond>(
		(props) => factory(props),
		{
			open: [
				() => openState,
				(v) => {
					openState = v;
					open = openState;
				}
			],
			data: () => data,
			disabled: () => disabled,
			value: () => value
		},
		{ preset: () => preset }
	);
	const bond = binding.bond.share();
	const rootAtom = createAtomInstance<CollapsibleRootAtom, CollapsibleBond>('root', {
		bond,
		factory: (owner) => new CollapsibleRootAtom(owner as CollapsibleBond)
	});
	const rootProps = $derived(
		mergeAtomProps(rootAtom, preset, { ...binding.stateProps, ...restProps })
	);

	function defaultFactory(props: CollapsibleStateProps) {
		return CollapsibleBond.create(props);
	}

	export function getBond() {
		return bond;
	}
</script>

<HtmlAtom
	class={['border-border flex w-full flex-col overflow-hidden', '$preset', klass]}
	{...rootProps}
>
	{@render children?.({ collapsible: bond })}
</HtmlAtom>
