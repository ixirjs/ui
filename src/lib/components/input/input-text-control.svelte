<script lang="ts">
	import { useControl, INPUT_FIELD_CLASS } from './shared';
	import { cn } from '$ixirjs/ui/utils';
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
		type: () => type
	});

	function handleInput(event: Event) {
		oninput?.(event);
		if (event.defaultPrevented) return;

		value = (event.currentTarget as HTMLInputElement).value;
		control.setValue(value);
		control.notify(onvaluechange, value, event, 'input');
	}
</script>

<!-- `value` is an attribute, not a binding: `handleInput` below is the sole writer. -->
<input
	{value}
	{type}
	{placeholder}
	{disabled}
	{readonly}
	class={cn(INPUT_FIELD_CLASS, control.class)}
	{...control.attrs}
	{onchange}
	oninput={handleInput}
/>
