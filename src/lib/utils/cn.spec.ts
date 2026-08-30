import { describe, expect, it } from 'vitest';
import { cn } from './index';

describe('cn', () => {
	it('lets an axis shorthand clear the logical longhands a preset set', () => {
		// A preset written as `ps-2 pe-7` used to survive a consumer's `px-2`, and Tailwind emits
		// `.pe-*` after `.px-*`, so the preset won in the cascade.
		expect(cn('ps-2 pe-7', 'px-2')).toBe('px-2');
		expect(cn('ms-2 me-7', 'mx-2')).toBe('mx-2');
		expect(cn('border-s border-e-2', 'border-x-4')).toBe('border-x-4');
	});

	it('still lets a logical longhand override the shorthand', () => {
		expect(cn('px-3', 'pe-10')).toBe('px-3 pe-10');
	});
});
