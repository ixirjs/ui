<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { onDestroy } from 'svelte';
	import { useRoot } from '$ixirjs/ui/shared';
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { FieldBond, type FieldStateProps } from './bond.svelte';
	import type { FieldRootProps } from '$ixirjs/ui/components/form/types';
	import { FormBond } from '$ixirjs/ui/components/form/bond.svelte';

	const formBond = FormBond.get();

	const ID = $props.id();

	let {
		value = $bindable(),
		class: klass = '',
		preset = undefined,
		name = undefined,
		disabled = false,
		readonly = false,
		schema = undefined,
		validator = undefined,
		extend = {},
		factory = defaultFactory,
		children = undefined,
		...restProps
	}: FieldRootProps<E, B> = $props();

	let valueState = $derived(value);

	const root = useRoot(
		FieldBond,
		{
			name: [() => name, (v) => (name = v)],
			value: [
				() => valueState,
				(v) => {
					valueState = v;
					value = valueState;
				}
			],
			type: () => typeof valueState,
			disabled: () => disabled,
			readonly: () => readonly,
			schema: () => schema,
			validator: () =>
				(validator ??
					(formBond?.props as { validator?: FieldStateProps['validator'] } | undefined)
						?.validator) as FieldStateProps['validator'],
			extend: () => extend
		},
		{ preset: () => preset, id: () => ID, factory: (props) => factory(props) }
	);
	const bond = root.bond;

	const unmount = formBond?.mountField(bond.id, bond) ?? (() => {});
	onDestroy(() => unmount());

	function defaultFactory(props: FieldStateProps) {
		return FieldBond.create(props);
	}

	export function getBond() {
		return bond;
	}
</script>

<HtmlAtom class={['flex flex-col', '$preset', klass]} {...root.props} {...restProps} part={root}>
	{@render children?.({ field: bond })}
</HtmlAtom>
