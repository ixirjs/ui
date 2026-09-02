<script lang="ts">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { FieldContext } from './bond.svelte';
	import type { StateChangeContext } from '$ixirjs/ui/types';
	import type {
		FieldControlChangeDetails,
		FieldControlProps
	} from '$ixirjs/ui/components/form/types';

	let {
		as = undefined,
		base = undefined,
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
	}: FieldControlProps = $props();

	const bond = FieldContext.getOrThrow('<Field.Control /> must be used within a <Field.Root />');

	// The control's id, written here so the label can name it in `for`.
	const id = Kernel.id(bond.id, 'field-control');
	bond.controlId = id;

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

	// The ordinary control reaches a native leaf unless the consumer supplies `base`; the value
	// shapes and handlers travel as element props so a renderer receives them unchanged.
	// Read once at init, matching field-root's `factory` read: `class` must be a static string, and
	// the wrapper's own class must not land on a consumer-supplied `base` (e.g. Input.Control).
	const hasBase = untrack(() => base !== undefined);

	const el = Kernel.element(
		() => ({
			...restProps,
			value,
			checked,
			number,
			date,
			...(files === undefined ? {} : { files }),
			name: bond.props.name,
			oninput: handleInput,
			onchange: handleChange,
			onblur: handleBlur,
			onvaluechange: handleValueChange,
			onnumberchange: handleNumberChange,
			onfileschange: handleFilesChange,
			ondatechange: handleDateChange,
			oncheckedchange: handleCheckedChange
		}),
		{
			preset: 'field.control',
			class: hasBase ? '' : 'border-border flex items-center',
			state: bond,
			as: () => as,
			base: () => base,
			attrs: () => {
				const disabled = bond.props.disabled;
				const readonly = bond.props.readonly;
				const required = bond.props.required ?? false;
				const invalid = bond.isInvalid;
				return {
					id,
					'aria-labelledby': bond.labelId,
					'aria-describedby': bond.descriptionId,
					disabled: disabled || undefined,
					'data-disabled': disabled ? '' : undefined,
					'aria-disabled': disabled ? 'true' : 'false',
					readonly: readonly || undefined,
					'data-readonly': readonly ? '' : undefined,
					'aria-readonly': readonly ? 'true' : 'false',
					required: required || undefined,
					'data-required': required ? '' : undefined,
					// No meaningful "false": an optional control does not advertise the attribute.
					'aria-required': required ? 'true' : undefined,
					'data-invalid': invalid ? '' : undefined,
					'aria-invalid': invalid ? 'true' : 'false',
					'data-touched': bond.isTouched ? '' : undefined,
					'data-dirty': bond.isDirty ? '' : undefined,
					'data-validating': bond.isValidating ? '' : undefined,
					// Points at the error text only while it is actually on the page.
					'aria-errormessage': invalid && bond.errorId ? bond.errorId : undefined
				};
			}
		}
	);
	// Bound once, in the script: `{@render leaf(...)}` with a plain identifier compiles to a direct
	// call on both platforms — no snippet block, no hydration anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children, { field: bond })}
