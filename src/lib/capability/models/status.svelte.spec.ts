import { describe, expect, it } from 'vitest';
import { createStatus } from './status.svelte';

describe('createStatus', () => {
	it('names exactly the accessors it was given, in declaration order', () => {
		const status = createStatus({
			disabled: () => false,
			invalid: () => true,
			required: () => true
		});

		expect(status.names).toEqual(['disabled', 'invalid', 'required']);
	});

	it('reads each status live, and an undeclared status is false', () => {
		let invalid = false;
		const status = createStatus({ invalid: () => invalid });

		expect(status.is('invalid')).toBe(false);
		invalid = true;
		expect(status.is('invalid')).toBe(true);
		expect(status.is('busy')).toBe(false);
	});
});
