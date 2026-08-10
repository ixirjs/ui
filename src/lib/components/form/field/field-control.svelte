<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { FieldBond } from './bond.svelte';
	const PART = Kernel.part(FieldBond, 'control', { class: '' });
</script>

<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
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
		onblur = undefined,
		onvaluechange = undefined,
		onnumberchange = undefined,
		onfileschange = undefined,
		ondatechange = undefined,
		oncheckedchange = undefined,
		...restProps
	}: FieldControlProps<E, B> & BasePropsOf<B> = $props();

	const part = Kernel.node(PART, () => ({ preset }), { context: 'required' });
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
		// Every semantic change handler funnels through here, so this is the one place the 'input'
		// trigger has to live. `validateOn` is a no-op unless the field's mode allows it.
		bond.validateOn('input');
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

	// The missing half of the trigger story: leaving a control is what marks it visited, which is
	// what the default 'touched' mode waits for before it will show anything.
	function handleBlur(event: FocusEvent) {
		bond.markTouched();
		bond.validateOn('blur');
		onblur?.(event);
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

	// The ordinary control reaches a native leaf unless the consumer supplies `base`.
	const el = Kernel.element(
		{ atom: part.atom, bond, preset: part.preset, presetLayer: part.presetLayer },
		() => ({
			class: ['flex items-center', '$preset', klass],
			...restProps,
			base,
			value,
			checked,
			number,
			date,
			...(files === undefined ? {} : { files }),
			name,
			bond,
			oninput: handleInput,
			onchange: handleChange,
			onblur: handleBlur,
			onvaluechange: handleValueChange,
			onnumberchange: handleNumberChange,
			onfileschange: handleFilesChange,
			ondatechange: handleDateChange,
			oncheckedchange: handleCheckedChange
		})
	);
</script>

{@render Kernel.render(el)(
	el.tag(),
	el.class(),
	el.attrs(),
	children,
	{ field: bond },
	el.motion(),
	el
)}
