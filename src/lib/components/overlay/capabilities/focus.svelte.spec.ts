import { describe, expect, it } from 'vitest';
import { trappedFocus, focusOnOpen, noFocus, FOCUS } from '../policies/focus.svelte';

describe('focus policies', () => {
	it('trappedFocus lives in slot "focus" with restore config as surface', () => {
		const cap = trappedFocus({ restoreFocus: 'previous', captureFocusOnOpen: true });
		expect(cap.slot).toBe(FOCUS);
		expect(cap.surface?.restoreFocus).toBe('previous');
		expect(cap.surface?.captureFocusOnOpen).toBe(true);
	});

	it('trappedFocus projects Tab-cycle handlers onto "surface" and onmount onto "content"', () => {
		const cap = trappedFocus();
		const surface = cap.behavior!('surface');
		const content = cap.behavior!('content');
		expect(typeof surface?.handlers).toBe('function');
		expect('onkeydown' in (surface!.handlers!({} as never))).toBe(true);
		expect(typeof content?.onmount).toBe('function');
	});

	it('focusOnOpen projects only the content onmount (no Tab trap)', () => {
		const cap = focusOnOpen();
		expect(cap.behavior!('surface')).toBeUndefined();
		expect(typeof cap.behavior!('content')?.onmount).toBe('function');
	});

	it('noFocus projects nothing on either role', () => {
		expect(noFocus.behavior!('surface')).toBeUndefined();
		expect(noFocus.behavior!('content')).toBeUndefined();
	});

	it('projects nothing for unrelated roles', () => {
		const cap = trappedFocus();
		expect(cap.behavior!('trigger')).toBeUndefined();
		expect(cap.behavior!('item')).toBeUndefined();
	});
});
