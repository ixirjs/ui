<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { onDestroy } from 'svelte';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { bindBond } from '$svelte-atoms/core/shared/bond/bind.svelte';
	import { HtmlAtom, mergeAtomProps, type Base } from '$svelte-atoms/core/components/atom';
	import { FieldBond, FieldRootAtom, type FieldStateProps } from './bond.svelte';
	import type { FieldRootProps } from '../types';
	import { FormBond } from '../bond.svelte';

	const formBond = FormBond.get();

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

	const binding = bindBond<FieldBond>(
		(props) => factory(props),
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
		{ preset: () => preset }
	);
	const bond = binding.bond.share();
	const rootAtom = createAtomInstance<FieldRootAtom, FieldBond, HTMLElement>('root', {
		bond,
		factory: (owner) => new FieldRootAtom(owner as FieldBond)
	});
	const rootProps = $derived(
		mergeAtomProps(rootAtom, preset, { ...binding.stateProps, ...restProps })
	);

	const unmount = formBond?.mountField(bond.id, bond) ?? (() => {});
	onDestroy(() => unmount());

	function defaultFactory(props: FieldStateProps) {
		return FieldBond.create(props);
	}

	export function getBond() {
		return bond;
	}
</script>

<HtmlAtom class={['flex flex-col', '$preset', klass]} {...rootProps}>
	{@render children?.({ field: bond })}
</HtmlAtom>
