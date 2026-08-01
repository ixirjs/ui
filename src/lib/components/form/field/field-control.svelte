<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { FieldBond } from './bond.svelte';
	import type { FieldControlProps } from '../types';

	type InputDetail = { value?: unknown; files?: File[]; date?: Date | null; number?: number; checked?: boolean }

	const bond = FieldBond.get();
	const name = $derived(bond?.state?.props?.name);

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
	
	const atom = bond?.atom('control');

	const controlProps = $derived.by(() => {
		return {
			preset: preset ?? atom?.preset,
			...(atom?.spread ?? {}),
			...restProps
		};
	});

	function handleInput(
		ev: InputEvent,
		inputDetail: InputDetail
	) {
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

		bond.state.props.value = value
		bond.state.props.files = files
		bond.state.props.date = date
		bond.state.props.number = number
		bond.state.props.checked = checked = detail?.checked ?? false;
	}
</script>

<HtmlAtom
	{value}
	{checked}
	{name}
	class={['flex items-center', '$preset', klass]}
	oninput={(ev: InputEvent, detail: InputDetail) => handleInput(ev, detail)}
	{...controlProps}
>
	{@render children?.({ field: bond })}
</HtmlAtom>
