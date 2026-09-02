<script lang="ts">
	import { useControl, INPUT_FIELD_CLASS } from './shared';
	import type { InputTextControlProps } from './types';

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

	const control = useControl({
		preset: () => presetKey,
		restProps: () => restProps,
		class: () => klass,
		variantProps: () => ({ disabled, readonly, type }),
		type: () => type,
		base: INPUT_FIELD_CLASS
	});
</script>

<!-- `value` is an attribute, not a binding: `control.handleInput` below is the sole writer. -->
<input
	{value}
	{type}
	{placeholder}
	{disabled}
	{readonly}
	class={control.class}
	{...control.attrs}
	{onchange}
	oninput={control.handleInput(oninput, onvaluechange, (next) => (value = next))}
/>
