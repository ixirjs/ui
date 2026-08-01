<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import { usePart } from '$ixirjs/ui/shared';
	import { FieldBond } from './bond.svelte';
	import type { StateChangeContext } from '$ixirjs/ui/types';
	import type {
		FieldControlChangeDetails,
		FieldControlProps
	} from '$ixirjs/ui/components/form/types';

	let {
		class: klass = '',
		base = undefined,
		preset = undefined,
		value = $bindable(),
		checked = $bindable(false),
		number = $bindable<number | undefined>(),
		date = $bindable<Date | null>(null),
		files = $bindable<File[] | null>(),
		children = undefined,
		oninput = undefined,
		onchange = undefined,
		onvaluechange = undefined,
		onnumberchange = undefined,
		onfileschange = undefined,
		ondatechange = undefined,
		oncheckedchange = undefined,
		...restProps
	}: FieldControlProps<E, B> = $props();

	const part = usePart(FieldBond, 'control', () => restProps, {
		preset: () => preset
	});
	const bond = part.bond;
	const name = $derived(bond.props.name);

	type IncomingContext = StateChangeContext<unknown> & Partial<FieldControlChangeDetails>;

	function commitBond() {
		bond.props.value = value;
		bond.props.files = files ?? [];
		bond.props.date = date;
		// Field.Control is type-agnostic; undefined means the active control has no numeric value.
		bond.props.number = number as number;
		bond.props.checked = checked;
	}

	function callbackContext(context: IncomingContext) {
		return {
			...context,
			bond,
			value,
			files: files ?? [],
			date,
			number,
			checked
		};
	}

	function applyContext(context: IncomingContext) {
		if ('files' in context) files = context.files ?? [];
		if ('date' in context) date = context.date ?? null;
		if ('number' in context) number = context.number;
		if ('checked' in context) checked = context.checked ?? false;
	}

	function handleInput(event: Event) {
		oninput?.(event);
	}

	function handleChange(event: Event) {
		onchange?.(event);
	}

	function handleValueChange(next: unknown, context: IncomingContext) {
		value = next;
		applyContext(context);
		commitBond();
		onvaluechange?.(value, callbackContext(context));
	}

	function handleNumberChange(next: number | undefined, context: IncomingContext) {
		number = next;
		value = 'value' in context ? context.value : next;
		applyContext(context);
		commitBond();
		onnumberchange?.(number, callbackContext(context));
	}

	function handleFilesChange(next: File[], context: IncomingContext) {
		files = next;
		if ('value' in context) value = context.value;
		applyContext(context);
		commitBond();
		onfileschange?.(files ?? [], callbackContext(context));
	}

	function handleDateChange(next: Date | null, context: IncomingContext) {
		date = next;
		if ('value' in context) value = context.value;
		applyContext(context);
		commitBond();
		ondatechange?.(date, callbackContext(context));
	}

	function handleCheckedChange(next: boolean, context: IncomingContext) {
		checked = next;
		value = 'value' in context ? context.value : next;
		applyContext(context);
		commitBond();
		oncheckedchange?.(checked, callbackContext(context));
	}
</script>

<HtmlAtom
	class={['flex items-center', '$preset', klass]}
	{...restProps}
	{part}
	{base}
	{value}
	{checked}
	{number}
	{date}
	{...files === undefined ? {} : { files }}
	{name}
	{bond}
	oninput={handleInput}
	onchange={handleChange}
	onvaluechange={handleValueChange}
	onnumberchange={handleNumberChange}
	onfileschange={handleFilesChange}
	ondatechange={handleDateChange}
	oncheckedchange={handleCheckedChange}
>
	{@render children?.({ field: bond })}
</HtmlAtom>
