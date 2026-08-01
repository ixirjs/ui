import { defineCapability, sharedCapabilityKey, type Capability } from '../capability';

export const VALIDATION = sharedCapabilityKey<ValidationModel>('@svelte-atoms/cap:validation');

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

export interface ValidationBacking<T = unknown> {
	validate?: () => ValidationResult<T>;
	validateAsync?: () => Promise<ValidationResult<T>>;
}

export interface ValidationModel<T = unknown> {
	readonly errors: readonly ValidationError[];
	readonly isInvalid: boolean;
	readonly isValidating: boolean;
	validate(): ValidationResult<T>;
	validateAsync(): Promise<ValidationResult<T>>;
	clear(): void;
}

function ok<T = unknown>(): ValidationResult<T> {
	return { success: true, errors: [] };
}

export function createValidation<T = unknown>(
	backing: ValidationBacking<T> = {}
): ValidationModel<T> {
	let errors = $state<ValidationError[]>([]);
	let isValidating = $state(false);

	function apply(result: ValidationResult<T>): ValidationResult<T> {
		errors = result.errors;
		return result;
	}

	function validate(): ValidationResult<T> {
		return apply(backing.validate?.() ?? ok<T>());
	}

	return {
		get errors() {
			return [...errors];
		},
		get isInvalid() {
			return errors.length > 0;
		},
		get isValidating() {
			return isValidating;
		},
		validate,
		async validateAsync() {
			if (!backing.validateAsync) return validate();

			isValidating = true;
			try {
				return apply(await backing.validateAsync());
			} finally {
				isValidating = false;
			}
		},
		clear() {
			errors = [];
		}
	};
}

export interface ValidationProjectionOptions {
	roles?: readonly string[];
	errorRoles?: readonly string[];
}

export function validationCapability<T = unknown>(
	validation: ValidationModel<T>,
	options: ValidationProjectionOptions = {}
): Capability<ValidationModel<T>> {
	const roles = options.roles ?? ['control'];
	const errorRoles = options.errorRoles ?? ['error'];
	const projects = [...roles, ...errorRoles];

	return defineCapability<ValidationModel<T>>({
		slot: VALIDATION,
		surface: validation,
		meta: {
			layer: 1,
			kind: 'model',
			projects,
			docs: 'Validation model and scoped validation status projection.'
		},
		behavior: (role) => {
			if (roles.includes(role)) {
				return {
					attrs: () => ({
						'aria-invalid': validation.isInvalid ? 'true' : 'false',
						'data-invalid': validation.isInvalid ? '' : undefined,
						'data-validating': validation.isValidating ? '' : undefined
					})
				};
			}
			if (errorRoles.includes(role)) {
				return {
					attrs: () => ({
						'data-invalid': validation.isInvalid ? '' : undefined,
						'data-validating': validation.isValidating ? '' : undefined
					})
				};
			}
			return undefined;
		}
	});
}
