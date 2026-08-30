import { describe, expect, it, vi } from 'vitest';
import { createValidation, type ValidationError, type ValidationResult } from './validation.svelte';

const error: ValidationError = { path: ['email'], message: 'Required', code: 'required' };

describe('createValidation', () => {
	it('stores validation errors and exposes invalid/pending state', () => {
		const run = vi.fn<() => ValidationResult>(() => ({
			errors: [error]
		}));
		const validation = createValidation({ run });

		expect(validation.errors).toEqual([]);
		expect(validation.isInvalid).toBe(false);

		expect(validation.validate()).toEqual({ errors: [error] });
		expect(run).toHaveBeenCalledOnce();
		expect(validation.errors).toEqual([error]);
		expect(validation.isInvalid).toBe(true);

		validation.clear();
		expect(validation.errors).toEqual([]);
		expect(validation.isInvalid).toBe(false);
	});

	it('marks async validation as pending until the result resolves', async () => {
		let resolve!: (result: ValidationResult) => void;
		const validation = createValidation({
			run: () =>
				new Promise<ValidationResult>((done) => {
					resolve = done;
				})
		});

		const pending = validation.validate();
		expect(validation.isValidating).toBe(true);

		resolve({ errors: [error] });
		await expect(pending).resolves.toEqual({ errors: [error] });
		expect(validation.isValidating).toBe(false);
		expect(validation.errors).toEqual([error]);
	});

	it('keeps the latest async result and pending state when validations settle out of order', async () => {
		const resolvers: Array<(result: ValidationResult) => void> = [];
		const validation = createValidation({
			run: () =>
				new Promise<ValidationResult>((done) => {
					resolvers.push(done);
				})
		});

		const first = validation.validate();
		const second = validation.validate();
		expect(validation.isValidating).toBe(true);

		resolvers[0]!({ errors: [error] });
		await first;
		expect(validation.isValidating).toBe(true);
		expect(validation.errors).toEqual([]);

		resolvers[1]!({ errors: [] });
		await second;
		expect(validation.isValidating).toBe(false);
		expect(validation.errors).toEqual([]);
	});
});
