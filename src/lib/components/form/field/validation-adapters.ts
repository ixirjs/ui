// The Zod adapter below bridges an untyped external schema: `schema.parse` returns
// the parsed data and the thrown error's `issues` have no type we control, so `any`
// is inherent to the shim. Narrowing buys no real safety here.
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ValidationError {
	path: (string | number)[];
	message: string;
	code?: string;
}

export interface ValidationResult<T = unknown> {
	data?: T;
	errors: ValidationError[];
}

export interface ValidationAdapter<Schema, Value> {
	validate(schema: Schema, value: Value): ValidationResult<Value>;
	validateAsync?(schema: Schema, value: Value): Promise<ValidationResult<Value>>;
}

export class ZodAdapter<
	T extends { parse: (value: unknown) => any; parseAsync?: (value: unknown) => Promise<any> }
> implements ValidationAdapter<T, any> {
	validate(schema: T, value: unknown): ValidationResult<any> {
		try {
			const data = schema.parse(value);
			return { data, errors: [] };
		} catch (error: any) {
			if (error?.issues && Array.isArray(error.issues)) {
				return {
					errors: error.issues.map((issue: any) => ({
						path: issue.path || [],
						message: issue.message || 'Validation error',
						code: issue.code
					}))
				};
			}
			throw error;
		}
	}

	async validateAsync(schema: T, value: unknown): Promise<ValidationResult<any>> {
		if (!schema.parseAsync) {
			return this.validate(schema, value);
		}

		try {
			const data = await schema.parseAsync(value);
			return { data, errors: [] };
		} catch (error: any) {
			if (error?.issues && Array.isArray(error.issues)) {
				return {
					errors: error.issues.map((issue: any) => ({
						path: issue.path || [],
						message: issue.message || 'Validation error',
						code: issue.code
					}))
				};
			}
			throw error;
		}
	}
}
