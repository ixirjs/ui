<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { ToastBond } from './bond.svelte';
	import type { ToastRootProps } from './types';
	import { controlledProp, useRoot } from '$ixirjs/ui/shared';

	const ID = $props.id();

	let {
		open = $bindable(true),
		disabled = false,
		duration = 0,
		dismissible = true,
		preset = undefined,
		factory = (props) => ToastBond.create(props),
		children = undefined,
		onopenchange = undefined,
		...restProps
	}: ToastRootProps<E, B> = $props();

	const openProp = controlledProp<boolean, ToastBond>({
		get: () => open,
		set: (value) => (open = value),
		onchange: (value, context) => onopenchange?.(value, context),
		context: (bond) => bond.takeOpenChangeContext()
	});

	const root = useRoot(
		ToastBond,
		{
			open: openProp,
			disabled: () => disabled,
			dismissible: () => dismissible,
			duration: () => duration
		},
		{
			preset: () => preset,
			id: () => ID,
			factory: (props) => factory(props)
		}
	);
	const bond = root.bond;

	export function getBond() {
		return bond;
	}
</script>

<HtmlAtom {...root.props} {...restProps} part={root}>
	{@render children?.({ toast: bond })}
</HtmlAtom>
