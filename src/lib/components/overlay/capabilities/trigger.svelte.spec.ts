import { describe, expect, it, vi } from 'vitest';
import { clickTrigger, TRIGGER } from '$ixirjs/ui/components/overlay/policies/trigger.svelte';
import type { OverlayView } from '$ixirjs/ui/components/overlay/types';

// Minimal Overlay-ish stub: what the trigger policy reads. `nodeByPart` stands in for the node
// registry — the policy resolves the content id through it rather than rebuilding the id string.
function fakeBond(
	isOpen = false,
	isDisabled = false,
	contentId: string | undefined = 'content-b1'
) {
	return {
		id: 'b1',
		namespace: 'popover',
		isOpen,
		isDisabled,
		toggle: vi.fn(),
		nodeByPart: (part: string) => (part === 'content' && contentId ? { id: contentId } : undefined)
	} as unknown as OverlayView;
}

describe('clickTrigger — trigger policy', () => {
	it('lives in slot "trigger" with no surface (stateless policy)', () => {
		const cap = clickTrigger();
		expect(cap.slot).toBe(TRIGGER);
		expect(cap.surface).toBeUndefined();
		expect(cap.meta).toMatchObject({
			projects: ['trigger']
		});
	});

	it('projects disclosure ARIA + gesture handlers onto "trigger"', () => {
		const cap = clickTrigger({ ariaHasPopup: 'menu' });
		const b = cap.behavior!('trigger')!;
		const attrs = b.attrs!(fakeBond(true, false));
		expect(attrs['aria-expanded']).toBe(true);
		expect(attrs['aria-haspopup']).toBe('menu');
		expect(attrs['aria-controls']).toBe('content-b1');
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
		expect((bond as unknown as { toggle: ReturnType<typeof vi.fn> }).toggle).toHaveBeenCalled();
	});

	it('projects nothing for non-trigger roles', () => {
		expect(clickTrigger().behavior!('surface')).toBeUndefined();
		expect(clickTrigger().behavior!('content')).toBeUndefined();
	});
});
