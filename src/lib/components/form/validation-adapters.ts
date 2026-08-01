// These adapters bridge untyped external schema libraries (Yup, Joi): the schema
// objects, the values they validate, and the errors they throw have no shared types
// we control, so `any` is inherent to the shim. Narrowing buys no real safety here.
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ValidationAdapter, ValidationResult, ValidationError } from './field/bond.svelte';

export class YupValidationAdapter implements ValidationAdapter<any, any> {
	validate(schema: any, value: any): ValidationResult {
		try {
			schema.validateSync(value, { abortEarly: false });
			return { success: true, data: value, errors: [] };
		} catch (error: any) {
			const errors: ValidationError[] =
				error.inner?.map((err: any) => ({
					path: err.path?.split('.') || [],
					message: err.message || 'Validation error',
					code: err.type
				})) || [];

			return {
				success: false,
				data: value,
				errors
			};
		}
	}

	async validateAsync(schema: any, value: any): Promise<ValidationResult> {
		try {
			const data = await schema.validate(value, { abortEarly: false });
			return { success: true, data, errors: [] };
		} catch (error: any) {
			const errors: ValidationError[] =
				error.inner?.map((err: any) => ({
					path: err.path?.split('.') || [],
					message: err.message || 'Validation error',
					code: err.type
				})) || [];

			return {
				success: false,
				data: value,
				errors
			};
		}
	}
}

export class JoiValidationAdapter implements ValidationAdapter<any, any> {
	validate(schema: any, value: any): ValidationResult {
		const result = schema.validate(value, { abortEarly: false });

		if (result.error) {
			const errors: ValidationError[] = result.error.details.map((detail: any) => ({
				path: detail.path || [],
				message: detail.message || 'Validation error',
				code: detail.type
			}));

			return {
				success: false,
				data: value,
				errors
			};
		}

		return {
			success: true,
			data: result.value,
			errors: []
		};
	}
}

export class CustomValidationAdapter<T> implements ValidationAdapter<(value: T) => string[], T> {
	validate(validationFn: (value: T) => string[], value: T): ValidationResult<T> {
		const messages = validationFn(value);

		if (messages.length > 0) {
			const errors: ValidationError[] = messages.map((message) => ({
				path: [],
				message,
				code: 'custom'
			}));

			return {
				success: false,
				data: value,
				errors
			};
		}

		return {
			success: true,
			data: value,
			errors: []
		};
	}
}
