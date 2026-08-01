<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { bindBond } from '$svelte-atoms/core/shared/bind-bond.svelte';
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { CollapsibleBond, CollapsibleState, type CollapsibleStateProps } from './bond.svelte';
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

	const binding = bindBond<CollapsibleBond>(
		(props) => factory(props),
		{
			open: [() => open, (v) => (open = v)],
			data: () => data,
			disabled: () => disabled,
			value: () => value
		},
		{ preset: () => preset }
	);
	const bond = binding.bond.share();

	function defaultFactory(props: CollapsibleStateProps) {
		const bondState = new CollapsibleState(props);
		return new CollapsibleBond(bondState).share();
	}

	export function getBond() {
		return bond;
	}
</script>

<HtmlAtom
	class={['border-border flex w-full flex-col overflow-hidden', '$preset', klass]}
	{...binding.props}
	{...restProps}
>
	{@render children?.({ collapsible: bond })}
</HtmlAtom>
