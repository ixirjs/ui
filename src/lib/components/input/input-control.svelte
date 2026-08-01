<script lang="ts" generics="B extends Base = Base">
	import {
		resolveControlPreset,
		INPUT_FIELD_CLASS,
		inputChangeContext,
		writeInputChecked,
		writeInputFiles,
		writeInputRawValue
	} from './shared';
	import { cn } from '$ixirjs/ui/utils';
	import type { Base } from '$ixirjs/ui/components/atom';
	import { usePart } from '$ixirjs/ui/shared';
	import { InputBond } from './bond.svelte';
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
	}: InputControlProps<B> = $props();

	// Native input presentation stays with its adapter; usePart owns context, Atom identity,
	// registration, roles, and teardown.
	const part = usePart(InputBond, 'input', {}, { context: 'optional' });
	const bond = part.bond;
	const preset = resolveControlPreset(
		() => presetKey,
		bond,
		() => restProps,
		() => klass,
		undefined,
		() => presetLayer as PresetLike | undefined
	);

	const valueProps = $derived({
		...part.atom.spread,
		...preset.attrs
	});

	function changeDetails() {
		return { value, files, date, number, checked };
	}

	function handleChange(event: Event) {
		onchange?.(event);
	}

	function handleInput(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		oninput?.(event);
		if (event.defaultPrevented) return;

		const input = event.currentTarget;
		const inputType = input.type;

		if (inputType === 'file') {
			files = Array.from(input.files ?? []);
			writeInputFiles(bond, files);
			onfileschange?.(files, inputChangeContext(bond, event, 'input', changeDetails()));
			return;
		}

		value =
			inputType === 'number'
				? input.value.trim() === '' || Number.isNaN(input.valueAsNumber)
					? undefined
					: input.valueAsNumber
				: input.value;
		writeInputRawValue(bond, value);

		if (inputType === 'number') {
			number =
				input.value.trim() === '' || Number.isNaN(input.valueAsNumber)
					? undefined
					: input.valueAsNumber;
			onnumberchange?.(
				number,
				inputChangeContext(bond, event, number === undefined ? 'clear' : 'input', changeDetails())
			);
		}

		if (['date', 'time', 'datetime-local', 'month', 'week'].includes(inputType)) {
			date = input.valueAsDate;
			ondatechange?.(date, inputChangeContext(bond, event, 'input', changeDetails()));
		}

		if (inputType === 'checkbox' || inputType === 'radio') {
			checked = input.checked;
			writeInputChecked(bond, checked);
			oncheckedchange?.(checked, inputChangeContext(bond, event, 'input', changeDetails()));
		}

		onvaluechange?.(
			value,
			inputChangeContext(
				bond,
				event,
				inputType === 'number' && number === undefined ? 'clear' : 'input',
				changeDetails()
			)
		);
	}
</script>

<input
	class={cn(INPUT_FIELD_CLASS, preset.class)}
	{...valueProps}
	type={type ?? 'text'}
	value={type === 'file' ? undefined : value}
	{checked}
	onchange={handleChange}
	oninput={handleInput}
/>
