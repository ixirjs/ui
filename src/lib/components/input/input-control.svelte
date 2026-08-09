<script lang="ts" generics="B extends Base = Base">
	import { useControl, INPUT_FIELD_CLASS, toFiniteNumber } from './shared';
	import { cn } from '$ixirjs/ui/utils';
	import type { Base, BasePropsOf } from '$ixirjs/ui/components/atom';
	import { DATE_INPUT_TYPES } from './bond.svelte';
	import type { InputControlProps } from './types';
	import type { PresetLike } from '$ixirjs/ui/preset';

	let {
		value = $bindable(),
		files = $bindable(),
		date = $bindable(),
		number = $bindable(),
		checked = $bindable(),
		class: klass = '',
		type = 'text',
		preset: presetKey = 'input.control',
		presetLayer = undefined as PresetLike | undefined,
		onchange = undefined,
		oninput = undefined,
		onvaluechange = undefined,
		onnumberchange = undefined,
		onfileschange = undefined,
		ondatechange = undefined,
		oncheckedchange = undefined,
		// pulled out of restProps: a void `<input>` can't take a (1-arg) children snippet.
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		children = undefined,
		...restProps
	}: InputControlProps<B> & BasePropsOf<B> = $props();

	const control = useControl({
		preset: () => presetKey,
		restProps: () => restProps,
		class: () => klass,
		instance: () => presetLayer as PresetLike | undefined
	});

	const valueProps = $derived(control.attrs);

	function changeDetails() {
		return { value, files, date, number, checked };
	}

	function handleInput(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		oninput?.(event);
		if (event.defaultPrevented) return;

		const input = event.currentTarget;
		const inputType = input.type;

		if (inputType === 'file') {
			files = Array.from(input.files ?? []);
			control.setFiles(files);
			control.notify(onfileschange, files, event, 'input', changeDetails());
			return;
		}

		value = inputType === 'number' ? toFiniteNumber(input) : input.value;
		control.setValue(value);

		if (inputType === 'number') {
			number = toFiniteNumber(input);
			control.notify(
				onnumberchange,
				number,
				event,
				number === undefined ? 'clear' : 'input',
				changeDetails()
			);
		}

		if (DATE_INPUT_TYPES.includes(inputType)) {
			date = input.valueAsDate;
			control.notify(ondatechange, date, event, 'input', changeDetails());
		}

		if (inputType === 'checkbox' || inputType === 'radio') {
			checked = input.checked;
			control.setChecked(checked);
			control.notify(oncheckedchange, checked, event, 'input', changeDetails());
		}

		control.notify(
			onvaluechange,
			value,
			event,
			inputType === 'number' && number === undefined ? 'clear' : 'input',
			changeDetails()
		);
	}
</script>

<input
	class={cn(INPUT_FIELD_CLASS, control.class)}
	{...valueProps}
	type={type ?? 'text'}
	value={type === 'file' ? undefined : value}
	{checked}
	{onchange}
	oninput={handleInput}
/>
