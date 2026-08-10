import { Bond, defineAtom, type BondStateProps } from '$ixirjs/ui/shared/bond';
import { defineBond, type BondOf } from '$ixirjs/ui/shared';
import {
	labelledControl,
	errorMessageLink
} from '$ixirjs/ui/shared/capability/models/relationship.svelte';
import {
	createValidation,
	isPromise,
	validationCapability,
	type ValidationError,
	type ValidationModel,
	type ValidationResult
} from '$ixirjs/ui/shared/capability/models/validation.svelte';
import { createStatus, statusCapability } from '$ixirjs/ui/shared/capability/models/status.svelte';
import { standardSchemaSource, type StandardSchemaV1 } from '$ixirjs/ui/shared/validation';
import { FormBond, type ValidationMode } from '$ixirjs/ui/components/form/bond.svelte';

export type { ValidationError, ValidationResult };

export type FieldStateProps<
	Extension extends Record<string, unknown> = Record<string, unknown>,
	Value = unknown
> = BondStateProps & {
	disabled: boolean;
	readonly: boolean;
	// Optional, unlike disabled/readonly: absent reads as false, so existing constructors stand.
	required?: boolean;
	name?: string;
	value?: Value;
	files?: File[];
	date?: Date | null;
	number?: number;
	checked?: boolean;
	type?: string;
	/** A Standard Schema checked against this field's value alone, independent of the form's. */
	schema?: StandardSchemaV1;
	/** Overrides the form's trigger mode for this field. */
	mode?: ValidationMode;
	onvalidation?: (result: ValidationResult<Value>) => void;
	extend: Extension;
};

/** What caused a validation attempt. `shouldValidateOn` turns this into a yes or no. */
export type ValidationTrigger = 'input' | 'blur' | 'submit';

export class FieldBondBase<Props extends FieldStateProps = FieldStateProps> extends Bond<Props> {
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

	#touched = $state(false);
	#initial: unknown;

	constructor(props: Props, name = 'field') {
		super(props, name);
		this.form = FormBond.getOptional<FormBond>();
		this.#initial = props.value;

		// A labelled, validated field. Declared here rather than behind a recipe: field is the only
		// caller, and the recipe's own status default was already overridden by `status` above.
		this.registerCapabilities([
			labelledControl({ nativeFor: true }),
			statusCapability(this.status, { roles: ['control'] }),
			// The merged view, not `this.validation` — otherwise a form-level error would style and
			// announce nothing, because the field's own model never saw it.
			validationCapability(this.#mergedValidation()),
			// `live` promotes the error node to role="alert". Safe here because `Field.Error` renders
			// only while the field is invalid, so the alert fires when the error appears, not on mount.
			errorMessageLink({ invalid: () => this.isInvalid, live: true })
		]);
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

	/** A read-through view over `errors`, so every consumer of the VALIDATION slot sees both sources. */
	#mergedValidation(): ValidationModel {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const field = this;
		return {
			get errors() {
				return field.errors;
			},
			get isInvalid() {
				return field.isInvalid;
			},
			get isValidating() {
				return field.isValidating;
			},
			validate: () => this.validate(),
			set: (result) => this.validation.set(result),
			clear: () => this.clear()
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

export const FieldRootAtom = defineAtom<FieldBondBase>('root', {
	slot: '@ixirjs/field:root',
	docs: 'Field root group labelling and validation state projection.',
	attrs: (_node, bond) => {
		const hasErrors = (bond?.errors.length ?? 0) > 0;
		// Prefer the error message when there is one, but fall back to the helper text: a field
		// with errors and no `Field.Error` rendered still has something to describe it.
		const described = hasErrors
			? (bond?.nodeByRole('error') ?? bond?.nodeByRole('description'))
			: bond?.nodeByRole('description');

		return {
			role: 'group',
			'aria-labelledby': bond?.nodeByRole('label')?.id,
			'aria-describedby': described?.id,
			'aria-invalid': `${hasErrors}`
		};
	}
});

export const FieldLabelAtom = defineAtom<FieldBondBase>('label');
// `for` and id come from the labelledControl link (role:'label', nativeFor).

export const FieldControlAtom = defineAtom<FieldBondBase>('control');

export const FieldDescriptionAtom = defineAtom<FieldBondBase>('description');

// The error message target. Separate from the description: the helper text used to claim the
// 'error' role too, which pointed `aria-errormessage` at prose that is not the error.
export const FieldErrorAtom = defineAtom<FieldBondBase>('error');

// FieldBond — label/control fold in the labelled-control link via their roles; validation lives on the Bond.

export const FieldBond = defineBond({
	name: 'field',
	base: FieldBondBase,
	atoms: {
		root: FieldRootAtom,
		label: { atom: FieldLabelAtom, role: 'label' },
		control: { atom: FieldControlAtom, role: 'control' },
		description: { atom: FieldDescriptionAtom, role: 'description' },
		error: { atom: FieldErrorAtom, role: 'error' }
	}
});

// Instance type — paired with the const above.
export type FieldBond = BondOf<typeof FieldBond>;
