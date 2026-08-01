<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { onDestroy } from 'svelte';
	import { bindBond } from '$svelte-atoms/core/shared/bind-bond.svelte';
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { FieldBond, FieldBondState, type FieldStateProps } from './bond.svelte';
	import type { FieldRootProps } from '../types';
	import { FormBond } from '../bond.svelte';

	const formBond = FormBond.get();

	let {
		value = $bindable(),
		class: klass = '',
		preset = undefined,
		name = undefined,
		schema = undefined,
		validator = undefined,
		factory = defaultFactory,
		children = undefined,
		...restProps
	}: FieldRootProps<E, B> = $props();

	const binding = bindBond<FieldBond>(
		(props) => factory(props),
		{
			name: [() => name, (v) => (name = v)],
			value: [() => value, (v) => (value = v)],
			type: () => typeof value,
			schema: () => schema,
			validator: () =>
				(validator ??
					(formBond?.state?.props as { validator?: FieldStateProps['validator'] } | undefined)
						?.validator) as FieldStateProps['validator']
		},
		{ preset: () => preset }
	);
	const bond = binding.bond.share();

	const unmount = formBond?.state.mountField(bond.id, bond) ?? (() => {});
	onDestroy(() => unmount());

	function defaultFactory(props: FieldStateProps) {
		const bondState = new FieldBondState(props);
		return new FieldBond(bondState);
	}

	export function getBond() {
		return bond;
	}
	
</script>

<HtmlAtom class={['flex flex-col', '$preset', klass]} {...binding.props} {...restProps}>
	{@render children?.({ field: bond })}
</HtmlAtom>
