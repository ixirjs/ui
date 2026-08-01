<script lang="ts" generics="B extends Base = Base">
	import { on } from '$svelte-atoms/core/attachments/event.svelte';
	import { resolveControlPreset, INPUT_FIELD_CLASS, writeInputValue } from './shared';
	import { cn, toClassValue } from '$svelte-atoms/core/utils';
	import type { Base } from '$svelte-atoms/core/components/atom';
	import { InputBond } from './bond.svelte';
	import type { InputControlProps } from './types';

	const bond = InputBond.get();

	let {
		value = $bindable(),
		files = $bindable(),
		date = $bindable(),
		number = $bindable(),
		checked = $bindable(),
		class: klass = '',
		type = 'text',
		preset: presetKey = 'input.control',
		onchange = undefined,
		oninput = undefined,
		...restProps
	}: InputControlProps<B> = $props();

	const preset = resolveControlPreset(() => presetKey, bond);

	const valueProps = $derived({
		...(bond?.atom('input').spread ?? {}),
		...restProps
	});

	// Single source of truth for the change/input detail payload (reads current bindable values).
	const changeDetail = (event: Event) => ({ value, files, date, number, checked, event });

	function handleChange(ev: CustomEvent) {
		if (!onchange) return;

		onchange?.(ev, changeDetail(ev));
	}

	function handleInput(ev: InputEvent) {
		if (!oninput) return;

		const currentTarget = ev.currentTarget as HTMLInputElement;

		if (type === 'number') {
			number = currentTarget.valueAsNumber;
		}

		if (type === 'date' || type == 'time' || type === 'datetime-local' || type === 'date-local') {
			date = currentTarget.valueAsDate;
		}

		oninput?.(ev, changeDetail(ev));
	}
</script>

<input
	bind:value={
		() => value,
		(v) => {
			value = v;
			// Write through the bond's InputModel rather than poking `props.value` directly.
			writeInputValue(bond, v);
		}
	}
	class={cn(
		INPUT_FIELD_CLASS,
		preset?.class,
		toClassValue(klass, bond)
	)}
	type={type ?? 'text'}
	onchange={handleChange}
	oninput={handleInput}
	{...valueProps}
	{@attach (node) => {
		if (type === 'file') {
			return on('input', () => {
				files = Array.from(node.files || []);
				bond!.state.props.files = files;
			})(node);
		}
	}}
/>
