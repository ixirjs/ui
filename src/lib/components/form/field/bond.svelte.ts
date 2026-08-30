/**
 * A field's shared object — a plain state class on the redesigned `Kernel`.
 *
 * Same surface the family always had (`{ field }`, `getBond`, `factory`, `validate`, `errors`,
 * `status`), none of the runtime. The parent form comes from context; the label/control/description/
 * error ids are `$state` here, written by each part at its init, and every cross-part ARIA reference
 * (`for`, `aria-labelledby`, `aria-describedby`, `aria-errormessage`) is read from them.
 */
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import {
	createValidation,
	isPromise,
	type ValidationError,
	type ValidationModel,
	type ValidationResult
} from '$ixirjs/ui/capability/models/validation.svelte';
import { createStatus } from '$ixirjs/ui/capability/models/status.svelte';
import { standardSchemaSource, type StandardSchemaV1 } from '$ixirjs/ui/validation';
import {
	FormContext,
	type FormBond,
	type ValidationMode
} from '$ixirjs/ui/components/form/bond.svelte';

export type { ValidationError, ValidationResult };

export type FieldStateProps<
	Extension extends Record<string, unknown> = Record<string, unknown>,
	Value = unknown
> = {
	id?: string | undefined;
	disabled: boolean;
	readonly: boolean;
	// Optional, unlike disabled/readonly: absent reads as false, so existing constructors stand.
	required?: boolean | undefined;
	name?: string | undefined;
	value?: Value | undefined;
	files?: File[] | undefined;
	date?: Date | null | undefined;
	number?: number | undefined;
	checked?: boolean | undefined;
	type?: string | undefined;
	/** A Standard Schema checked against this field's value alone, independent of the form's. */
	schema?: StandardSchemaV1 | undefined;
	/** Overrides the form's trigger mode for this field. */
	mode?: ValidationMode | undefined;
	onvalidation?: ((result: ValidationResult<Value>) => void) | undefined;
	extend: Extension;
};

/** What caused a validation attempt. `shouldValidateOn` turns this into a yes or no. */
export type ValidationTrigger = 'input' | 'blur' | 'submit';

export const FieldContext = Kernel.context<FieldBond>('bond/field');

function optionalForm(): FormBond | undefined {
	// Outside component init (a unit test) there is no context to read.
	try {
		return FormContext.get();
	} catch {
		return undefined;
	}
}

export class FieldBond<Props extends FieldStateProps = FieldStateProps> {
	readonly name = 'field';
	readonly props: Props;
	/** Results from this field's own `schema`. Form-level errors are merged in by `errors`. */
	readonly validation: ValidationModel = createValidation({ run: () => this.#run() });
	/**
	 * The parent form, when there is one. A Field works standalone; everything that reads this
	 * treats absence as "no form-level errors, default mode".
	 */
	readonly form: FormBond | undefined;
	readonly status = createStatus({
		disabled: () => this.props.disabled,
		readonly: () => this.props.readonly,
		required: () => this.props.required ?? false,
		invalid: () => this.isInvalid,
		touched: () => this.isTouched,
		dirty: () => this.isDirty
	});

	/** Part element ids, once each has rendered. */
	labelId = $state<string | undefined>();
	controlId = $state<string | undefined>();
	descriptionId = $state<string | undefined>();
	errorId = $state<string | undefined>();

	#touched = $state(false);
	#initial: unknown;

	constructor(props: Props, form?: FormBond) {
		this.props = props;
		this.form = form ?? optionalForm();
		this.#initial = props.value;
	}

	static create(props: FieldStateProps): FieldBond {
		return new FieldBond(props);
	}

	get id(): string {
		return this.props.id ?? 'field';
	}
	get rootId(): string {
		return Kernel.id(this.id, 'field-root');
	}

	get value() {
		return this.props.value;
	}

	get files() {
		return this.props.files;
	}

	get date() {
		return this.props.date;
	}

	get number() {
		return this.props.number;
	}

	get isChecked() {
		return this.props.checked;
	}

	/** Errors from this field's own schema, before the form's are merged in. */
	get ownErrors(): readonly ValidationError[] {
		return this.validation.errors;
	}

	/**
	 * Everything wrong with this field, from either direction: its own schema, and the slice of the
	 * form's errors whose path matches this field's `name`.
	 */
	get errors(): readonly ValidationError[] {
		const own = this.validation.errors;
		const fromForm = this.form?.errorsFor(this.props.name) ?? [];
		if (fromForm.length === 0) return own;
		return own.length === 0 ? fromForm : [...own, ...fromForm];
	}

	get isInvalid(): boolean {
		return this.errors.length > 0;
	}

	get isValidating(): boolean {
		return this.validation.isValidating;
	}

	get isTouched(): boolean {
		return this.#touched;
	}

	/** Whether the value has moved since the field mounted or was last reset. */
	get isDirty(): boolean {
		return !Object.is(this.value, this.#initial);
	}

	get mode(): ValidationMode {
		return this.props.mode ?? this.form?.mode ?? 'touched';
	}

	/** The trigger policy, in one place, so the control and the root cannot disagree. */
	shouldValidateOn(trigger: ValidationTrigger): boolean {
		const mode = this.mode;
		if (mode === 'manual') return false;
		if (trigger === 'submit') return true;
		if (mode === 'submit') return false;
		if (mode === 'input') return true;
		if (mode === 'blur') return trigger === 'blur';
		// 'touched': blur always, then live once the user has actually been here.
		return trigger === 'blur' || this.isTouched || this.form?.isSubmitted === true;
	}

	markTouched(): void {
		this.#touched = true;
	}

	resetInteraction(): void {
		this.#touched = false;
		this.#initial = this.value;
	}

	validate(): ValidationResult | Promise<ValidationResult> {
		return this.validation.validate();
	}

	clear() {
		this.validation.clear();
	}

	/** Runs on the trigger the current `mode` allows; a no-op otherwise. */
	validateOn(trigger: ValidationTrigger): void {
		if (!this.shouldValidateOn(trigger)) return;
		void this.validate();
		// A form-level schema owns cross-field rules, so this field's slice of them is only as fresh
		// as the last form run. Re-run the form source alone — not its fan-out, which would validate
		// every sibling on one field's blur.
		if (this.form?.props.schema || this.form?.props.source?.validate) void this.form.validateSelf();
	}

	toJSON() {
		return {
			name: this.props.name,
			value: this.value
		};
	}

	#run(): ValidationResult | Promise<ValidationResult> {
		const { schema, value, onvalidation } = this.props;

		if (!schema) {
			const result: ValidationResult = { data: value, errors: [] };
			onvalidation?.(result);
			return result;
		}

		// The field's own value, not a values object: `z.string().min(3)` on a field means the value.
		const outcome = standardSchemaSource(schema).validate!(value);
		if (isPromise(outcome)) {
			return outcome.then((result) => {
				onvalidation?.(result);
				return result;
			});
		}

		onvalidation?.(outcome);
		return outcome;
	}
}
