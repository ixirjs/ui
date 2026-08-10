import { describe, expect, it } from 'vitest';
import { superformsSource } from '$ixirjs/ui/components/form/sources/superforms.svelte';
import type { ErrorRecord } from '$ixirjs/ui/shared/validation';

/** The minimum a Svelte store is: subscribe, emit synchronously, return an unsubscriber. */
function store<T>(initial: T) {
	let value = initial;
	const runs = new Set<(value: T) => void>();
	return {
		subscribe(run: (value: T) => void) {
			runs.add(run);
			run(value);
			return () => runs.delete(run);
		},
		set(next: T) {
			value = next;
			for (const run of runs) run(value);
		}
	};
}

describe('superformsSource', () => {
	it('reads errors, values and submitting straight off the stores', () => {
		const errors = store<ErrorRecord>({ email: ['Already taken.'] });
		const form = store<Record<string, unknown>>({ email: 'ada@example.com' });
		const submitting = store(false);

		const source = superformsSource({ errors, form, submitting });

		expect(source.errors).toEqual([{ path: ['email'], message: 'Already taken.' }]);
		expect(source.values).toEqual({ email: 'ada@example.com' });
		expect(source.isSubmitting).toBe(false);
	});

	it('tracks every later store emission', () => {
		const errors = store<ErrorRecord>({});
		const form = store<Record<string, unknown>>({});
		const submitting = store(false);
		const source = superformsSource({ errors, form, submitting });

		expect(source.errors).toEqual([]);

		errors.set({ address: { street: ['Required.'] } });
		form.set({ address: { street: '' } });
		submitting.set(true);

		expect(source.errors).toEqual([{ path: ['address', 'street'], message: 'Required.' }]);
		expect(source.values).toEqual({ address: { street: '' } });
		expect(source.isSubmitting).toBe(true);
	});

	it('works without the optional submitting store', () => {
		const source = superformsSource({
			errors: store<ErrorRecord>({}),
			form: store<Record<string, unknown>>({})
		});
		expect(source.isSubmitting).toBe(false);
	});
});
