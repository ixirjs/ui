import { BondAtom, BondState, type BondStateProps } from '$svelte-atoms/core/shared/bond.svelte';
import { defineBond, type BondOf, type ViewOf } from '$svelte-atoms/core/shared';
import { labelledControl } from '$svelte-atoms/core/shared/capabilities/relationship.svelte';

export interface ValidationError {
	path: (string | number)[];
	message: string;
	code?: string;
}

export interface ValidationResult<T = unknown> {
	success: boolean;
	data?: T;
	errors: ValidationError[];
}

export interface ValidationAdapter<Schema, Value> {
	validate(schema: Schema, value: Value): ValidationResult<Value>;
	validateAsync?(schema: Schema, value: Value): Promise<ValidationResult<Value>>;
}

type ZodLikeIssue = {
	path?: (string | number)[];
	message?: string;
	code?: string;
};

type ZodLikeSchema = {
	parse: (value: unknown) => unknown;
	parseAsync?: (value: unknown) => Promise<unknown>;
};

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
};

// Bond shape the field atoms type `this.bond` against — breaks the atom↔bond cycle.
type FieldBondView = ViewOf<FieldBondState>;

export class FieldRootAtom extends BondAtom<FieldBondView, HTMLElement> {
	constructor(bond: FieldBondView) {
		super(bond, 'root');
	}

	override get attrs() {
		const hasErrors = this.bond.state.errors.length > 0;
		// Group is labelled by the atom that declared the 'label' role.
		return {
			...super.attrs,
			role: 'group',
			'aria-labelledby': this.bond.atomByRole('label')?.id,
			'aria-describedby': hasErrors ? `error-${this.bond.id}` : undefined,
			'aria-invalid': `${hasErrors}`
		};
	}
}

export class FieldLabelAtom extends BondAtom<FieldBondView, HTMLElement> {
	constructor(bond: FieldBondView) {
		super(bond, 'label');
	}
	// `for` and id come from the labelledControl link (role:'label', nativeFor).
}

export class FieldControlAtom extends BondAtom<FieldBondView, HTMLElement> {
	constructor(bond: FieldBondView) {
		super(bond, 'control');
	}

	override get attrs() {
		const hasErrors = this.bond.state.errors.length > 0;
		// `aria-labelledby` comes from labelledControl (role:'control'); rest is validation state.
		return {
			...super.attrs,
			'aria-describedby': hasErrors ? `error-${this.bond.id}` : undefined,
			'aria-invalid': `${hasErrors}`,
			'aria-disabled': `${this.bond.state.props.disabled}`,
			'aria-readonly': `${this.bond.state.props.readonly}`,
			'aria-errormessage': hasErrors ? `error-${this.bond.id}` : undefined
		};
	}
}

// FieldBond — label/control fold in the labelled-control link via their roles; validation on FieldBondState.
export const FieldBond = defineBond<
	{
		root: typeof FieldRootAtom;
		label: { atom: typeof FieldLabelAtom; role: 'label' };
		control: { atom: typeof FieldControlAtom; role: 'control' };
	},
	FieldBondState
>({
	name: 'field',
	atoms: {
		root: FieldRootAtom,
		label: { atom: FieldLabelAtom, role: 'label' },
		control: { atom: FieldControlAtom, role: 'control' }
	}
});

// Instance type — paired with the const above.
export type FieldBond = BondOf<typeof FieldBond>;

export class FieldBondState<
	Props extends FieldStateProps = FieldStateProps
> extends BondState<Props> {
	#errors = $state<ValidationError[]>([]);
	#isValidating = $state(false);

	constructor(props: Props) {
		super(props);
		// label ↔ control a11y linkage: control gets aria-labelledby, label gets `for`.
		this.capability(labelledControl({ nativeFor: true }));
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
		return [...this.#errors];
	}

	get isValidating() {
		return this.#isValidating;
	}

	validate(): ValidationResult {
		const { schema, validator, value, onvalidation } = this.props;

		if (!schema || !validator) {
			this.#errors = [];
			const result: ValidationResult = { success: true, data: value, errors: [] };
			onvalidation?.(result);
			return result;
		}

		const result = validator.validate(schema, value);

		this.#errors = result.errors;

		onvalidation?.(result);

		return result;
	}

	async validateASync(): Promise<ValidationResult> {
		const { schema, validator, value, onvalidation } = this.props;

		if (!schema || !validator) {
			this.#errors = [];
			const result: ValidationResult = { success: true, data: value, errors: [] };
			onvalidation?.(result);
			return result;
		}

		this.#isValidating = true;

		try {
			const result = validator.validateAsync
				? await validator.validateAsync(schema, value)
				: validator.validate(schema, value);

			this.#errors = result.errors;

			onvalidation?.(result);

			return result;
		} finally {
			this.#isValidating = false;
		}
	}

	clear() {
		this.#errors = [];
	}

	toJSON() {
		return {
			name: this.props.name,
			value: this.value
		};
	}
}
