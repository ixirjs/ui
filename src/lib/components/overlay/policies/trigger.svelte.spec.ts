import { describe, expect, it, vi } from 'vitest';
import {
	clickTrigger,
	hoverTrigger,
	contextMenuTrigger,
	manualTrigger,
	TRIGGER
} from './trigger.svelte';
import type { OverlayView } from '$ixirjs/ui/components/overlay/types';

// Minimal Overlay-ish stub: what the trigger policies read. `nodeByPart` stands in for the node
// registry — the policy resolves the content id through it rather than rebuilding the id string.
function mockBond(
	isOpen = false,
	isDisabled = false,
	contentId: string | undefined = 'content-b1'
) {
	return {
		id: 'b1',
		namespace: 'popover',
		isOpen,
		isDisabled,
		open: vi.fn(),
		close: vi.fn(),
		toggle: vi.fn(),
		nodeByPart: (part: string) => (part === 'content' && contentId ? { id: contentId } : undefined)
	} as unknown as OverlayView;
}

describe('clickTrigger', () => {
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
		const attrs = b.attrs!(mockBond(true, false));
		expect(attrs['aria-expanded']).toBe(true);
		expect(attrs['aria-haspopup']).toBe('menu');
		expect(attrs['aria-controls']).toBe('content-b1');
		expect(attrs['tabindex']).toBe(0);
		expect(typeof b.handlers).toBe('function');
		expect('onclick' in b.handlers!(mockBond())).toBe(true);
	});

	it('defaults aria-haspopup to "dialog" and tabindex to -1 when disabled', () => {
		const attrs = clickTrigger().behavior!('trigger')!.attrs!(mockBond(false, true));
		expect(attrs['aria-haspopup']).toBe('dialog');
		expect(attrs['aria-disabled']).toBe(true);
		expect(attrs['tabindex']).toBe(-1);
	});

	it('projects nothing for non-trigger roles', () => {
		expect(clickTrigger().behavior!('surface')).toBeUndefined();
		expect(clickTrigger().behavior!('content')).toBeUndefined();
	});

	it('onclick toggles', () => {
		const bond = mockBond();
		const h = clickTrigger().behavior!('trigger')!.handlers!(bond);
		(h.onclick as (ev: MouseEvent) => void)({ button: 0, defaultPrevented: false } as MouseEvent);
		expect(bond.toggle).toHaveBeenCalledTimes(1);
	});

	it('onclick ignores right-click', () => {
		const bond = mockBond();
		const h = clickTrigger().behavior!('trigger')!.handlers!(bond);
		(h.onclick as (ev: MouseEvent) => void)({ button: 2, defaultPrevented: false } as MouseEvent);
		expect(bond.toggle).not.toHaveBeenCalled();
	});

	it('onclick ignores defaultPrevented events', () => {
		const bond = mockBond();
		const h = clickTrigger().behavior!('trigger')!.handlers!(bond);
		(h.onclick as (ev: MouseEvent) => void)({ button: 0, defaultPrevented: true } as MouseEvent);
		expect(bond.toggle).not.toHaveBeenCalled();
	});

	it('Enter and Space toggle', () => {
		const bond = mockBond();
		const h = clickTrigger().behavior!('trigger')!.handlers!(bond);
		const prevent = vi.fn();
		(h.onkeydown as (ev: KeyboardEvent) => void)({
			key: 'Enter',
			preventDefault: prevent
		} as unknown as KeyboardEvent);
		(h.onkeydown as (ev: KeyboardEvent) => void)({
			key: ' ',
			preventDefault: prevent
		} as unknown as KeyboardEvent);
		expect(bond.toggle).toHaveBeenCalledTimes(2);
		expect(prevent).toHaveBeenCalledTimes(2);
	});

	it('Tab does NOT toggle', () => {
		const bond = mockBond();
		const h = clickTrigger().behavior!('trigger')!.handlers!(bond);
		(h.onkeydown as (ev: KeyboardEvent) => void)({
			key: 'Tab',
			preventDefault: () => undefined
		} as unknown as KeyboardEvent);
		expect(bond.toggle).not.toHaveBeenCalled();
	});
});

describe('hoverTrigger', () => {
	it('opens after openDelay ms on pointer-enter', () => {
		vi.useFakeTimers();
		const bond = mockBond();
		const b = hoverTrigger({ openDelay: 50, closeDelay: 50 }).behavior!('trigger')!;
		const h = b.handlers!(bond) as { onpointerenter: () => void };
		h.onpointerenter();
		expect(bond.open).not.toHaveBeenCalled();
		vi.advanceTimersByTime(50);
		expect(bond.open).toHaveBeenCalledTimes(1);
		vi.useRealTimers();
	});

	it('closes after closeDelay ms on pointer-leave', () => {
		vi.useFakeTimers();
		const bond = mockBond();
		const b = hoverTrigger({ openDelay: 50, closeDelay: 100 }).behavior!('trigger')!;
		const h = b.handlers!(bond) as { onpointerleave: () => void };
		h.onpointerleave();
		expect(bond.close).not.toHaveBeenCalled();
		vi.advanceTimersByTime(100);
		expect(bond.close).toHaveBeenCalledTimes(1);
		vi.useRealTimers();
	});

	it('clears pending timer on subsequent gesture', () => {
		vi.useFakeTimers();
		const bond = mockBond();
		const b = hoverTrigger({ openDelay: 100, closeDelay: 100 }).behavior!('trigger')!;
		const h = b.handlers!(bond) as { onpointerenter: () => void; onpointerleave: () => void };
		h.onpointerenter();
		vi.advanceTimersByTime(50);
		h.onpointerleave(); // cancels pending open
		vi.advanceTimersByTime(50); // past original open delay — should NOT fire
		expect(bond.open).not.toHaveBeenCalled();
		vi.advanceTimersByTime(50); // closeDelay fires
		expect(bond.close).toHaveBeenCalledTimes(1);
		vi.useRealTimers();
	});

	it('onmount returns a cleanup that clears pending timers', () => {
		vi.useFakeTimers();
		const bond = mockBond();
		const b = hoverTrigger({ openDelay: 100, closeDelay: 100 }).behavior!('trigger')!;
		const h = b.handlers!(bond) as { onpointerenter: () => void };
		const cleanup = b.onmount!({} as HTMLElement, bond);
		h.onpointerenter();
		(cleanup as () => void)();
		vi.advanceTimersByTime(200);
		expect(bond.open).not.toHaveBeenCalled();
		vi.useRealTimers();
	});
});

describe('contextMenuTrigger', () => {
	it('on contextmenu: preventDefault + open', () => {
		const bond = mockBond();
		const h = contextMenuTrigger().behavior!('trigger')!.handlers!(bond);
		const prevent = vi.fn();
		(h.oncontextmenu as (ev: MouseEvent) => void)({
			clientX: 100,
			clientY: 200,
			preventDefault: prevent
		} as unknown as MouseEvent);
		expect(prevent).toHaveBeenCalledTimes(1);
		expect(bond.open).toHaveBeenCalledTimes(1);
	});
});

describe('manualTrigger', () => {
	it('has no handlers (programmatic control only)', () => {
		expect(manualTrigger().behavior!('trigger')!.handlers).toBeUndefined();
	});
});
