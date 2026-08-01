<script lang="ts">
	import {
		resolveControlPreset,
		INPUT_FIELD_CLASS,
		inputChangeContext,
		writeInputValue
	} from './shared';
	import { cn } from '$ixirjs/ui/utils';
	import { InputBond } from './bond.svelte';
	import type { InputTextControlProps } from './types';

	const bond = InputBond.get();

	let {
		value = $bindable(''),
		class: klass = '',
		placeholder = '',
		disabled = false,
		readonly = false,
		type = 'text',
		preset: presetKey = 'input.text',
		onchange = undefined,
		oninput = undefined,
		onvaluechange = undefined,
		...restProps
	}: InputTextControlProps = $props();

	const preset = resolveControlPreset(
		() => presetKey,
		bond,
		() => restProps,
		() => klass,
		() => ({ disabled, readonly, type })
	);

	function handleChange(event: Event) {
		onchange?.(event);
	}

	function handleInput(event: Event) {
		oninput?.(event);
		if (event.defaultPrevented) return;

		value = (event.currentTarget as HTMLInputElement).value;
		writeInputValue(bond, value);
		onvaluechange?.(value, inputChangeContext(bond, event, 'input'));
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
	{type}
	{placeholder}
	{disabled}
	{readonly}
	class={cn(INPUT_FIELD_CLASS, preset.class)}
	{...preset.attrs}
	onchange={handleChange}
	oninput={handleInput}
/>
