export interface ValidationError {
	path: (string | number)[];
	message: string;
	code?: string;
}

export interface ValidationResult<T = unknown> {
	data?: T | undefined;
	errors: readonly ValidationError[];
}

export interface ValidationBacking<T = unknown> {
	/** May return synchronously or resolve later; a Standard Schema is allowed to do either. */
	run?: () => ValidationResult<T> | Promise<ValidationResult<T>>;
}

export interface ValidationModel<T = unknown> {
	readonly errors: readonly ValidationError[];
	readonly isInvalid: boolean;
	readonly isValidating: boolean;
	/**
	 * One entry point rather than a `validate`/`validateAsync` pair: Standard Schema returns
	 * sync-or-promise, so the split only forced every caller to know which kind it had. A sync
	 * schema still costs no promise; `await validate()` works for both.
	 */
	validate(): ValidationResult<T> | Promise<ValidationResult<T>>;
	/** Publish a result the model did not produce — externally owned errors. */
	set(result: ValidationResult<T>): void;
	clear(): void;
}

export function isPromise<T>(value: T | Promise<T>): value is Promise<T> {
	return typeof (value as { then?: unknown } | null)?.then === 'function';
}

// No `success` flag: `errors.length` is the single source of truth, and a second representation of
// the same fact is a desync waiting to happen — the deleted Yup adapter reported `success: false`
// with an empty error list, which every reader downstream saw as valid.
function ok<T = unknown>(): ValidationResult<T> {
	return { errors: [] };
}

export function createValidation<T = unknown>(
	backing: ValidationBacking<T> = {}
): ValidationModel<T> {
	let errors = $state<readonly ValidationError[]>([]);
	let isValidating = $state(false);
	// Bumped by every entry point, so a slow run that lost the race is discarded rather than
	// overwriting whatever superseded it.
	let request = 0;

	function apply(result: ValidationResult<T>): ValidationResult<T> {
		errors = [...result.errors];
		return result;
	}

	return {
		get errors() {
			return errors;
		},
		get isInvalid() {
			return errors.length > 0;
		},
		get isValidating() {
			return isValidating;
		},
		validate() {
			const current = ++request;
			isValidating = false;

			const outcome = backing.run?.() ?? ok<T>();
			if (!isPromise(outcome)) return apply(outcome);

			isValidating = true;
			return outcome.then(
				(result) => {
					if (current !== request) return result;
					isValidating = false;
					return apply(result);
				},
				(error: unknown) => {
					// A schema that throws is a bug in the schema, not a validation failure. Reporting
					// it as "no errors" is what made the deleted Yup adapter silently pass.
					if (current === request) isValidating = false;
					throw error;
				}
			);
		},
		set(result) {
			request++;
			isValidating = false;
			apply(result);
		},
		clear() {
			request++;
			isValidating = false;
			errors = [];
		}
	};
}
