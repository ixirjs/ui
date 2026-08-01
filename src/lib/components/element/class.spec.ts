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

	it('matches border-border as a whole token only, not as a prefix', () => {
		expect(withDefaultBorder('border-border-foo')).toBe('border-border border-border-foo');
	});

	it('keeps a consumer border colour after the default so source order lets it win', () => {
		// `border-border` first, consumer `border-red-500` second → CSS source order gives the
		// consumer the win — the same resolution the removed second twMerge produced.
		expect(withDefaultBorder('border-red-500')).toBe('border-border border-red-500');
	});

	it('flattens array/object class values via clsx', () => {
		expect(withDefaultBorder(['px-2', 'py-1'])).toBe('border-border px-2 py-1');
		expect(withDefaultBorder({ 'px-2': true, hidden: false })).toBe('border-border px-2');
	});

	it('does NOT re-run twMerge — conflicting utilities are left as-is (kernel already merged)', () => {
		// twMerge would collapse `px-2 px-4` → `px-4`; the renderer must not, proving the second
		// merge pass is gone.
		expect(withDefaultBorder('px-2 px-4')).toBe('border-border px-2 px-4');
	});
});
