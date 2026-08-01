<script lang="ts">
	import { resolveControlPreset, INPUT_FIELD_CLASS, writeInputValue } from './shared';
	import { cn, toClassValue } from '$svelte-atoms/core/utils';
	import { InputBond } from './bond.svelte';
	import type { InputTextControlProps } from './types';

	const bond = InputBond.get();

	let {
		value = $bindable(''),
		class: klass = '',
		placeholder = '',
		disabled = false,
		readonly = false,
		preset: presetKey = 'input.text',
		onchange = undefined,
		oninput = undefined,
		...restProps
	}: InputTextControlProps = $props();

	const preset = resolveControlPreset(() => presetKey, bond);

	function handleChange(ev: Event) {
		onchange?.(ev, { value });
	}

	function handleInput(ev: Event) {
		const input = ev.currentTarget as HTMLInputElement;
		value = input.value;

		oninput?.(ev, { value });

		if(ev.defaultPrevented) {
			return;
		}

		writeInputValue(bond, value);
	}
</script>

<input
	bind:value={
		() => value,
		(v) => {
			value = v;
			writeInputValue(bond, v);
		}
	}
	type='text'
	{placeholder}
	{disabled}
	{readonly}
	class={cn(
		INPUT_FIELD_CLASS,
		preset?.class,
		toClassValue(klass, bond)
	)}
	onchange={handleChange}
	oninput={handleInput}
	{...restProps}
/>
