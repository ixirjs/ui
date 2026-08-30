import { describe, expect, it } from 'vitest';
import { withDefaultBorder } from './class';

describe('withDefaultBorder', () => {
	it('returns the default border colour for empty/undefined input', () => {
		expect(withDefaultBorder('')).toBe('border-border');
		expect(withDefaultBorder(undefined)).toBe('border-border');
		expect(withDefaultBorder(null)).toBe('border-border');
	});

	it('prepends the default when the consumer has no border colour', () => {
		expect(withDefaultBorder('px-2')).toBe('border-border px-2');
	});

	it('does not duplicate the default when it is already present', () => {
		expect(withDefaultBorder('border-border px-2')).toBe('border-border px-2');
		expect(withDefaultBorder('px-2 border-border')).toBe('px-2 border-border');
		expect(withDefaultBorder('px-2 border-border py-1')).toBe('px-2 border-border py-1');
	});

	it('lets a consumer border colour replace the default', () => {
		expect(withDefaultBorder('border-border-foo')).toBe('border-border-foo');
		expect(withDefaultBorder('border-red-500')).toBe('border-red-500');
	});

	it('keeps a border WIDTH alongside the default colour', () => {
		expect(withDefaultBorder('border-b')).toBe('border-border border-b');
	});

	it('flattens array/object class values', () => {
		expect(withDefaultBorder(['px-2', 'py-1'])).toBe('border-border px-2 py-1');
		expect(withDefaultBorder({ 'px-2': true, hidden: false })).toBe('border-border px-2');
	});

	it('merges conflicting utilities through cn', () => {
		expect(withDefaultBorder('px-2 px-4')).toBe('border-border px-4');
	});
});
