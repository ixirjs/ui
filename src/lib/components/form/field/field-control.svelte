<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, mergeAtomProps, type Base } from '$svelte-atoms/core/components/atom';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { FieldBond, FieldControlAtom } from './bond.svelte';
	import type { FieldControlProps, FieldInputDetail as InputDetail } from '../types';

	const bond = FieldBond.get();
	const name = $derived(bond?.props?.name);

	let {
		class: klass = '',
		preset = undefined,
		value = $bindable(),
		checked = $bindable(),
		number = $bindable(),
		date = $bindable(),
		files = $bindable(),
		children = undefined,
		oninput = undefined,
		...restProps
	}: FieldControlProps<E, B> = $props();

	const atom = bond
		? createAtomInstance<FieldControlAtom, FieldBond, HTMLElement>('control', {
				bond,
				factory: (owner) => new FieldControlAtom(owner as FieldBond).role('control')
			})
		: undefined;

	const controlProps = $derived(mergeAtomProps(atom, preset, restProps));

	function handleInput(ev: InputEvent, inputDetail: InputDetail) {
		oninput?.(ev, inputDetail);

		if (ev.defaultPrevented) {
			return;
		}

		const detail = inputDetail ?? {};

		value = detail?.value;
		files = detail?.files ?? [];
		date = detail?.date ?? null;
		if (detail?.number !== undefined) {
			number = detail.number;
		}
		checked = detail?.checked ?? false;

		if (!bond) {
			return;
		}

		bond.props.value = value;
		bond.props.files = files;
		// field-control is type-agnostic (props are loosely typed); narrow at the bond boundary.
		bond.props.date = date as Date | null;
		bond.props.number = number as number;
		bond.props.checked = checked = detail?.checked ?? false;
	}
</script>

<HtmlAtom
	{value}
	{checked}
	{name}
	{bond}
	class={['flex items-center', '$preset', klass]}
	oninput={(ev: InputEvent, detail: InputDetail) => handleInput(ev, detail)}
	{...controlProps}
>
	{@render children?.({ field: bond })}
</HtmlAtom>
