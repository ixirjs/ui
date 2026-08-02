<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { onDestroy } from 'svelte';
	import { useRoot } from '$ixirjs/ui/shared';
	import { type Base } from '$ixirjs/ui/components/atom';
	import { partElement, usePartElement } from '$ixirjs/ui/components/atom/part-element.svelte';
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
		factory = undefined,
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
		{ preset: () => preset, id: () => ID, factory: () => factory }
	);
	const bond = root.bond;

	const unmount = formBond?.mountField(bond.id, bond) ?? (() => {});
	onDestroy(() => unmount());

	export function getBond() {
		return bond;
	}

	const el = usePartElement(root, () => ({
		class: ['flex flex-col', '$preset', klass],
		...root.props,
		...restProps
	}));
</script>

{@render partElement(el, children, { field: bond })}
