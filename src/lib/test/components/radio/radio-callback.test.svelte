<script lang="ts">
	import { Radio, RadioGroup } from '$ixirjs/ui/components/radio';
	import type { StateChangeCallback } from '$ixirjs/ui/types';

	interface Props {
		oncheckedchange?: StateChangeCallback<boolean>;
		onpreviouscheckedchange?: StateChangeCallback<boolean>;
		onvaluechange?: StateChangeCallback<string>;
		oniteminput?: (event: Event) => void;
		onitemchange?: (event: Event) => void;
		ongroupinput?: (event: Event) => void;
		onstandalonecheckedchange?: StateChangeCallback<boolean>;
		onstandalonepreviouscheckedchange?: StateChangeCallback<boolean>;
		onstandaloneinput?: (event: Event) => void;
	}

	let {
		oncheckedchange,
		onpreviouscheckedchange,
		onvaluechange,
		oniteminput,
		onitemchange,
		ongroupinput,
		onstandalonecheckedchange,
		onstandalonepreviouscheckedchange,
		onstandaloneinput
	}: Props = $props();

	let value = $state('alpha');
	let standaloneValue = $state('alpha');
	let itemCommitted = $state<boolean[]>([]);
	let groupCommitted = $state<boolean[]>([]);
	let standaloneCommitted = $state<boolean[]>([]);

	function handlePreviousCheckedChange(
		checked: boolean,
		context: Parameters<StateChangeCallback<boolean>>[1]
	) {
		itemCommitted.push(value === 'beta');
		onpreviouscheckedchange?.(checked, context);
	}

	function handleCheckedChange(
		checked: boolean,
		context: Parameters<StateChangeCallback<boolean>>[1]
	) {
		itemCommitted.push(value === 'beta');
		oncheckedchange?.(checked, context);
	}

	function handleValueChange(
		nextValue: string,
		context: Parameters<StateChangeCallback<string>>[1]
	) {
		groupCommitted.push(value === nextValue);
		onvaluechange?.(nextValue, context);
	}

	function handleStandalonePreviousCheckedChange(
		checked: boolean,
		context: Parameters<StateChangeCallback<boolean>>[1]
	) {
		standaloneCommitted.push(standaloneValue === 'beta');
		onstandalonepreviouscheckedchange?.(checked, context);
	}

	function handleStandaloneCheckedChange(
		checked: boolean,
		context: Parameters<StateChangeCallback<boolean>>[1]
	) {
		standaloneCommitted.push(standaloneValue === 'beta');
		onstandalonecheckedchange?.(checked, context);
	}
</script>

<RadioGroup
	bind:value
	onvaluechange={handleValueChange}
	{...ongroupinput ? { oninput: ongroupinput } : {}}
>
	<Radio value="alpha" oncheckedchange={handlePreviousCheckedChange} />
	<Radio
		value="beta"
		oncheckedchange={handleCheckedChange}
		{...oniteminput ? { oninput: oniteminput } : {}}
		{...onitemchange ? { onchange: onitemchange } : {}}
	/>
</RadioGroup>

<Radio
	value="alpha"
	bind:group={standaloneValue}
	oncheckedchange={handleStandalonePreviousCheckedChange}
/>
<Radio
	value="beta"
	bind:group={standaloneValue}
	oncheckedchange={handleStandaloneCheckedChange}
	{...onstandaloneinput ? { oninput: onstandaloneinput } : {}}
/>

<output data-testid="radio-value">{value}</output>
<output data-testid="radio-item-committed">{itemCommitted.join(',')}</output>
<output data-testid="radio-group-committed">{groupCommitted.join(',')}</output>
<output data-testid="radio-standalone-value">{standaloneValue}</output>
<output data-testid="radio-standalone-committed">{standaloneCommitted.join(',')}</output>
