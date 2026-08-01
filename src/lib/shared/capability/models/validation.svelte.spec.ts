import { describe, expect, it, vi } from 'vitest';
import { Bond, Atom, bondContextKey, type BondStateProps } from '$ixirjs/ui/shared/bond';
import {
	createValidation,
	validationCapability,
	VALIDATION,
	type ValidationError,
	type ValidationResult
} from './validation.svelte';

class TestState {}

class TestBond extends Bond<BondStateProps> {
	static CONTEXT_KEY = bondContextKey('test-validation');
	constructor(readonly state = new TestState()) {
		super({}, 'test');
	}
	addAtom(key: string, role: string) {
		const atom = new TestAtom(this, key).role(role);
		this.register(atom, { key });
		return atom;
	}
}

class TestAtom extends Atom<TestBond> {
	constructor(bond: TestBond, key: string) {
		super(bond, key);
	}
}

const error: ValidationError = { path: ['email'], message: 'Required', code: 'required' };

describe('createValidation', () => {
	it('stores validation errors and exposes invalid/pending state', () => {
		const validate = vi.fn<() => ValidationResult>(() => ({
			success: false,
			errors: [error]
		}));
		const validation = createValidation({ validate });

		expect(validation.errors).toEqual([]);
		expect(validation.isInvalid).toBe(false);

		expect(validation.validate()).toEqual({ success: false, errors: [error] });
		expect(validate).toHaveBeenCalledOnce();
		expect(validation.errors).toEqual([error]);
		expect(validation.isInvalid).toBe(true);

		validation.clear();
		expect(validation.errors).toEqual([]);
		expect(validation.isInvalid).toBe(false);
	});

	it('marks async validation as pending until the result resolves', async () => {
		let resolve!: (result: ValidationResult) => void;
		const validation = createValidation({
			validateAsync: () =>
				new Promise<ValidationResult>((done) => {
					resolve = done;
				})
		});

		const pending = validation.validateAsync();
		expect(validation.isValidating).toBe(true);

		resolve({ success: false, errors: [error] });
		await expect(pending).resolves.toEqual({ success: false, errors: [error] });
		expect(validation.isValidating).toBe(false);
		expect(validation.errors).toEqual([error]);
	});

	it('keeps the latest async result and pending state when validations settle out of order', async () => {
		const resolvers: Array<(result: ValidationResult) => void> = [];
		const validation = createValidation({
			validateAsync: () =>
				new Promise<ValidationResult>((done) => {
					resolvers.push(done);
				})
		});

		const first = validation.validateAsync();
		const second = validation.validateAsync();
		expect(validation.isValidating).toBe(true);

		resolvers[0]!({ success: false, errors: [error] });
		await first;
		expect(validation.isValidating).toBe(true);
		expect(validation.errors).toEqual([]);

		resolvers[1]!({ success: true, errors: [] });
		await second;
		expect(validation.isValidating).toBe(false);
		expect(validation.errors).toEqual([]);
	});
});

describe('validationCapability', () => {
	it('exposes the validation surface and projects validation attrs onto controls', () => {
		const validation = createValidation({
			validate: () => ({
				success: false,
				errors: [error]
			})
		});
		const cap = validationCapability(validation);
		const bond = new TestBond();
		bond.capability(cap);
		const control = bond.addAtom('control', 'control');

		expect(cap.slot).toBe(VALIDATION);
		expect(cap.surface).toBe(validation);
		expect(cap.meta).toMatchObject({
			projects: ['control', 'error']
		});
		expect(control.spread['aria-invalid']).toBe('false');
		expect(control.spread['data-invalid']).toBeUndefined();

		validation.validate();
		expect(control.spread['aria-invalid']).toBe('true');
		expect(control.spread['data-invalid']).toBe('');
	});
});
