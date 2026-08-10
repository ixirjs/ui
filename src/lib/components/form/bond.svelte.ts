import type { FieldBond } from './field/bond.svelte';
import { bondContextKey, Bond, type BondStateProps } from '$ixirjs/ui/shared/bond';
import {
	createValidation,
	isPromise,
	type ValidationError,
	type ValidationModel,
	type ValidationResult
} from '$ixirjs/ui/shared/capability/models/validation.svelte';
import {
	errorsForPath,
	flattenErrorRecord,
	parsePath,
	setByPath,
	standardSchemaSource,
	type ErrorRecord,
	type StandardSchemaV1,
	type ValidationSource
} from '$ixirjs/ui/shared/validation';

/**
 * When a field re-checks itself.
 *
 * - `submit` — only when the form is submitted.
 * - `blur` — when the field loses focus, and on submit.
 * - `input` — on every keystroke.
 * - `touched` — on blur and submit, then on every keystroke *once the field has been visited*, so
 *   an error clears as the user fixes it but never appears before they have been there. The default.
 * - `manual` — never; the consumer calls `validate()`.
 */
export type ValidationMode = 'submit' | 'blur' | 'input' | 'touched' | 'manual';

export type FormProps<Extension extends Record<string, unknown> = Record<string, unknown>> =
	BondStateProps & {
		renderless?: boolean;
		/** Any Standard Schema — Zod, Valibot, ArkType, Effect. No adapter. */
		schema?: StandardSchemaV1;
		/** An externally owned validation source, for state this form does not own. */
		source?: ValidationSource;
		/** An externally owned error bag, flat or nested. Superforms' `$errors` fits directly. */
		errors?: ErrorRecord;
		mode?: ValidationMode;
		extend: Extension;
	};

export class FormBond<Props extends FormProps = FormProps> extends Bond<Props> {
	static CONTEXT_KEY = bondContextKey('form');

	/** Form-level results only. Field-level results live on each `FieldBond`. */
	readonly validation: ValidationModel = createValidation({ run: () => this.#run() });

	#submitted = $state(false);

	constructor(props: Props, name = 'form') {
		super(props, name);
		// Fields mount after the root activates capabilities; establish this collection first.
		void this.fields;
	}

	get mode(): ValidationMode {
		return this.props.mode ?? 'touched';
	}

	get isSubmitted(): boolean {
		return this.#submitted;
	}

	/** True only while a source drives submission itself (Superforms' `enhance`). */
	get isSubmitting(): boolean {
		return this.props.source?.isSubmitting ?? false;
	}

	get isValidating(): boolean {
		return this.validation.isValidating || this.fields.some((field) => field.isValidating);
	}

	/**
	 * The form's values as a nested object, keyed by each field's `name`. A source that owns the
	 * values wins — when Superforms holds `$form`, that is the truth, not what the DOM last echoed.
	 */
	get values(): Record<string, unknown> {
		const owned = this.props.source?.values;
		if (owned) return owned;

		const values: Record<string, unknown> = {};
		for (const field of this.fields) {
			const name = field.props.name;
			if (name) setByPath(values, parsePath(name), field.value);
		}
		return values;
	}

	/** Errors published by an external owner, as opposed to produced by `validate()`. */
	get pushedErrors(): readonly ValidationError[] {
		const fromRecord = flattenErrorRecord(this.props.errors);
		const fromSource = this.props.source?.errors ?? [];
		if (fromRecord.length === 0) return fromSource;
		return fromSource.length === 0 ? fromRecord : [...fromRecord, ...fromSource];
	}

	/** Form-level errors: everything not owned by an individual field's own schema. */
	get errors(): readonly ValidationError[] {
		const own = this.validation.errors;
		const pushed = this.pushedErrors;
		if (pushed.length === 0) return own;
		return own.length === 0 ? pushed : [...own, ...pushed];
	}

	/** Every error in the form, including each field's own. This is what `isValid` reads. */
	get allErrors(): readonly ValidationError[] {
		return [...this.errors, ...this.fields.flatMap((field) => field.ownErrors)];
	}

	errorsFor(name: string | undefined): ValidationError[] {
		return errorsForPath(this.errors, name);
	}

	get isInvalid(): boolean {
		return this.allErrors.length > 0;
	}

	get isValid(): boolean {
		return !this.isInvalid;
	}

	get isTouched(): boolean {
		return this.fields.some((field) => field.isTouched);
	}

	get isDirty(): boolean {
		return this.fields.some((field) => field.isDirty);
	}

	get fields(): FieldBond[] {
		return [...this.collection<FieldBond>('field').values];
	}

	mountField(id: string, atom: FieldBond) {
		// Collection.set registers + returns the cleanup (see shared/bond/collection.svelte.ts).
		return this.collection<FieldBond>('field').set(id, atom);
	}

	unmountField(id: string) {
		this.collection<FieldBond>('field').delete(id);
	}

	/** The form-level source only — no fan-out. What a single field's blur triggers. */
	validateSelf(): ValidationResult | Promise<ValidationResult> {
		return this.validation.validate();
	}

	/**
	 * Validate the form-level source *and* every field, then report the aggregate. Stays synchronous
	 * when nothing involved is async, so a Zod form never pays for a promise.
	 */
	validate(): ValidationResult | Promise<ValidationResult> {
		const outcomes = [this.validateSelf(), ...this.fields.map((field) => field.validate())];
		if (outcomes.some(isPromise)) return Promise.all(outcomes).then(() => this.#aggregate());
		return this.#aggregate();
	}

	markSubmitted(): void {
		this.#submitted = true;
		for (const field of this.fields) field.markTouched();
	}

	clear(): void {
		this.validation.clear();
		for (const field of this.fields) field.clear();
	}

	/** Clears errors *and* interaction state — the form is untouched again. */
	reset(): void {
		this.#submitted = false;
		this.clear();
		for (const field of this.fields) field.resetInteraction();
	}

	#aggregate(): ValidationResult {
		return { data: this.values, errors: this.allErrors };
	}

	#run(): ValidationResult | Promise<ValidationResult> {
		const { schema, source } = this.props;
		if (schema) return standardSchemaSource(schema).validate!(this.values);
		if (source?.validate) return source.validate(this.values);
		return { errors: [] };
	}
}
