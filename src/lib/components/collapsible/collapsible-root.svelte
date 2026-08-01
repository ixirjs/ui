<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { controlledProp, useRoot } from '@ixirjs/ui/shared';
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { CollapsibleBond, type CollapsibleStateProps } from './bond.svelte';
	import type { CollapsibleRootProps } from './types';

	const ID = $props.id();

	let {
		open = $bindable(false),
		class: klass = '',
		preset = undefined,
		value,
		data = undefined,
		disabled = false,
		factory = defaultFactory,
		onopenchange = undefined,
		children = undefined,
		...restProps
	}: CollapsibleRootProps<E, B> = $props();

	const openProp = controlledProp<boolean, CollapsibleBond>({
		get: () => open,
		set: (value) => (open = value),
		onchange: (value, context) => onopenchange?.(value, context)
	});

	const root = useRoot(
		CollapsibleBond,
		{
			open: openProp,
			data: () => data,
			disabled: () => disabled,
			value: () => value
		},
		{
			preset: () => preset,
			id: () => ID,
			factory: (props) => factory(props)
		}
	);
	const bond = root.bond;

	function defaultFactory(props: CollapsibleStateProps) {
		return CollapsibleBond.create(props);
	}

	export function getBond() {
		return bond;
	}
</script>

<HtmlAtom
	class={['border-border flex w-full flex-col overflow-hidden', '$preset', klass]}
	{...root.props}
	{...restProps}
	part={root}
>
	{@render children?.({ collapsible: bond })}
</HtmlAtom>
