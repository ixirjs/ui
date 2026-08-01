import { Bond, defineAtom, type BondStateProps } from '$svelte-atoms/core/shared/bond';
import { defineBond, type BondOf } from '$svelte-atoms/core/shared';
import {
	defineAtomCapability,
	sharedCapabilityKey,
	type AtomHost
} from '$svelte-atoms/core/shared/capability';
import {
	errorMessageLink,
	labelledControl
} from '$svelte-atoms/core/shared/capability/models/relationship.svelte';
import {
	createValidation,
	validationCapability,
	type ValidationError,
	type ValidationModel,
	type ValidationResult
} from '$svelte-atoms/core/shared/capability/models/validation.svelte';
import {
	createStatus,
	statusCapability
} from '$svelte-atoms/core/shared/capability/models/status.svelte';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type { ValidationError, ValidationResult };

export interface ValidationAdapter<Schema, Value> {
	validate(schema: Schema, value: Value): ValidationResult<Value>;
	validateAsync?(schema: Schema, value: Value): Promise<ValidationResult<Value>>;
}

// -----------------------------------------------------------------------------
// Internal types
// -----------------------------------------------------------------------------

type ZodLikeIssue = {
	path?: (string | number)[];
	message?: string;
	code?: string;
};

type ZodLikeSchema = {
	parse: (value: unknown) => unknown;
	parseAsync?: (value: unknown) => Promise<unknown>;
};

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function isZodLikeError(error: unknown): error is { issues: ZodLikeIssue[] } {
	return (
		typeof error === 'object' &&
		error !== null &&
		'issues' in error &&
		Array.isArray((error as { issues?: unknown }).issues)
	);
}

function toValidationError(issue: ZodLikeIssue): ValidationError {
	return {
		path: issue.path || [],
		message: issue.message || 'Validation error',
		...(issue.code ? { code: issue.code } : {})
	};
}

export class ZodValidationAdapter<T extends ZodLikeSchema> implements ValidationAdapter<
	T,
	unknown
> {
	validate(schema: T, value: unknown): ValidationResult {
		try {
			const data = schema.parse(value);
			return { success: true, data, errors: [] };
		} catch (error: unknown) {
			if (isZodLikeError(error)) {
				return {
					success: false,
					errors: error.issues.map(toValidationError)
				};
			}
			throw error;
		}
	}

	async validateAsync(schema: T, value: unknown): Promise<ValidationResult> {
		if (!schema.parseAsync) {
			return this.validate(schema, value);
		}

		try {
			const data = await schema.parseAsync(value);
			return { success: true, data, errors: [] };
		} catch (error: unknown) {
			if (isZodLikeError(error)) {
				return {
					success: false,
					errors: error.issues.map(toValidationError)
				};
			}
			throw error;
		}
	}
}

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type FieldStateProps<
	Extension extends Record<string, unknown> = Record<string, unknown>,
	Schema = unknown,
	Value = unknown
> = BondStateProps & {
	disabled: boolean;
	readonly: boolean;
	name?: string;
	value?: Value;
	files?: File[];
	date?: Date | null;
	number?: number;
	checked?: boolean;
	type?: string;
	schema?: Schema;
	validator?: ValidationAdapter<Schema, Value>;
	onvalidation?: (result: ValidationResult<Value>) => void;
	extend: Extension;
};

export type FieldDomElements = {
	root: HTMLElement;
	label: HTMLElement;
	control: HTMLElement;
	description: HTMLElement;
};

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

export class FieldBondBase<Props extends FieldStateProps = FieldStateProps> extends Bond<Props> {
	readonly validation: ValidationModel = createValidation({
		validate: () => this.#runValidation(),
		validateAsync: () => this.#runValidationAsync()
	});
	readonly status = createStatus({
		disabled: () => this.props.disabled,
		readonly: () => this.props.readonly
	});

	constructor(props: Props, name = 'field') {
		super(props, name);
		// label ↔ control a11y linkage: control gets aria-labelledby, label gets `for`.
		this.capability(labelledControl({ nativeFor: true }));
		this.capability(validationCapability(this.validation));
		this.capability(errorMessageLink({ invalid: () => this.validation.isInvalid }));
		this.capability(statusCapability(this.status, { roles: ['control'] }));
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

	get errors() {
		return this.validation.errors;
	}

	get isValidating() {
		return this.validation.isValidating;
	}

	validate(): ValidationResult {
		return this.validation.validate();
	}

	async validateASync(): Promise<ValidationResult> {
		return this.validation.validateAsync();
	}

	clear() {
		this.validation.clear();
	}

	#runValidation(): ValidationResult {
		const { schema, validator, value, onvalidation } = this.props;

		if (!schema || !validator) {
			const result: ValidationResult = { success: true, data: value, errors: [] };
			onvalidation?.(result);
			return result;
		}

		const result = validator.validate(schema, value);

		onvalidation?.(result);

		return result;
	}

	async #runValidationAsync(): Promise<ValidationResult> {
		const { schema, validator, value, onvalidation } = this.props;

		if (!schema || !validator) {
			const result: ValidationResult = { success: true, data: value, errors: [] };
			onvalidation?.(result);
			return result;
		}

		const result = validator.validateAsync
			? await validator.validateAsync(schema, value)
			: validator.validate(schema, value);

		onvalidation?.(result);

		return result;
	}

	toJSON() {
		return {
			name: this.props.name,
			value: this.value
		};
	}
}

// -----------------------------------------------------------------------------
// Internal types
// -----------------------------------------------------------------------------

type FieldBondView = FieldBondBase;

// -----------------------------------------------------------------------------
// Capability slots and shared helpers
// -----------------------------------------------------------------------------

const FIELD_ROOT = sharedCapabilityKey<void>('@svelte-atoms/field:root');

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

export const FieldRootAtom = defineAtom<FieldBondView>('root', (atom) => {
	atom.capability(fieldRootPresentation());
});
export type FieldRootAtom = InstanceType<typeof FieldRootAtom>;

export const FieldLabelAtom = defineAtom<FieldBondView>('label');
export type FieldLabelAtom = InstanceType<typeof FieldLabelAtom>;
// `for` and id come from the labelledControl link (role:'label', nativeFor).

export const FieldControlAtom = defineAtom<FieldBondView>('control');
export type FieldControlAtom = InstanceType<typeof FieldControlAtom>;

export const FieldDescriptionAtom = defineAtom<FieldBondView>('description', (atom) => {
	atom.role('error');
});
export type FieldDescriptionAtom = InstanceType<typeof FieldDescriptionAtom>;

// -----------------------------------------------------------------------------
// Atom capabilities
// -----------------------------------------------------------------------------

function fieldRootPresentation() {
	return defineAtomCapability<void, AtomHost, FieldBondView>({
		slot: FIELD_ROOT,
		meta: {
			layer: 1,
			kind: 'projection',
			projects: ['root'],
			docs: 'Field root group labelling and validation state projection.'
		},
		behavior: {
			attrs: (_node, bond) => {
				const hasErrors = (bond?.errors.length ?? 0) > 0;
				const description = bond?.atomByRole(hasErrors ? 'error' : 'description')?.id;

				return {
					role: 'group',
					'aria-labelledby': bond?.atomByRole('label')?.id,
					'aria-describedby': description,
					'aria-invalid': `${hasErrors}`
				};
			}
		}
	});
}

// FieldBond — label/control fold in the labelled-control link via their roles; validation lives on the Bond.

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

const FieldBondImpl = defineBond<
	{
		root: typeof FieldRootAtom;
		label: { atom: typeof FieldLabelAtom; role: 'label' };
		control: { atom: typeof FieldControlAtom; role: 'control' };
		description: { atom: typeof FieldDescriptionAtom; role: 'description' };
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	typeof FieldBondBase
>({
	name: 'field',
	base: FieldBondBase,
	atoms: {
		root: FieldRootAtom,
		label: { atom: FieldLabelAtom, role: 'label' },
		control: { atom: FieldControlAtom, role: 'control' },
		description: { atom: FieldDescriptionAtom, role: 'description' }
	}
});

// Instance type — paired with the const above.
export type FieldBond = BondOf<typeof FieldBondImpl>;

interface FieldBondConstructor {
	new (props: FieldStateProps): FieldBond;
	readonly CONTEXT_KEY: string;
	readonly spec: (typeof FieldBondImpl)['spec'];
	get(): FieldBond | undefined;
	getOrThrow(message?: string): FieldBond;
	set(bond: FieldBond): FieldBond;
	create(props: FieldStateProps): FieldBond;
}

export const FieldBond = FieldBondImpl as unknown as FieldBondConstructor;
