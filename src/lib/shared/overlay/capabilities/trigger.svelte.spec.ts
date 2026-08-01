import { describe, expect, it, vi } from 'vitest';
import { clickTrigger } from '../policies/trigger.svelte';
import type { OverlayView } from '../types';

// Minimal Overlay-ish stub: what the trigger policy reads.
function fakeBond(isOpen = false, isDisabled = false) {
	return {
		id: 'b1',
		namespace: 'popover',
		state: { isOpen, isDisabled, toggle: vi.fn() }
	} as unknown as OverlayView;
}

describe('clickTrigger — trigger policy', () => {
	it('lives in slot "trigger" with no surface (stateless policy)', () => {
		const cap = clickTrigger();
		expect(cap.slot).toBe('trigger');
		expect(cap.surface).toBeUndefined();
	});

	it('projects disclosure ARIA + gesture handlers onto "trigger"', () => {
		const cap = clickTrigger({ ariaHasPopup: 'menu' });
		const b = cap.behavior!('trigger')!;
		const attrs = b.attrs!(fakeBond(true, false));
		expect(attrs['aria-expanded']).toBe(true);
		expect(attrs['aria-haspopup']).toBe('menu');
		expect(attrs['aria-controls']).toContain('content');
		expect(attrs['tabindex']).toBe(0);
		expect(typeof b.handlers).toBe('function');
		expect('onclick' in b.handlers!(fakeBond())).toBe(true);
	});

	it('defaults aria-haspopup to "dialog" and tabindex to -1 when disabled', () => {
		const attrs = clickTrigger().behavior!('trigger')!.attrs!(fakeBond(false, true));
		expect(attrs['aria-haspopup']).toBe('dialog');
		expect(attrs['aria-disabled']).toBe(true);
		expect(attrs['tabindex']).toBe(-1);
	});

	it('click handler toggles the bond', () => {
		const bond = fakeBond();
		const handlers = clickTrigger().behavior!('trigger')!.handlers!(bond);
		(handlers.onclick as (e: Event) => void)({ button: 0, defaultPrevented: false } as MouseEvent);
		expect(
			(bond as unknown as { state: { toggle: ReturnType<typeof vi.fn> } }).state.toggle
		).toHaveBeenCalled();
	});

	it('projects nothing for non-trigger roles', () => {
		expect(clickTrigger().behavior!('surface')).toBeUndefined();
		expect(clickTrigger().behavior!('content')).toBeUndefined();
	});
});
