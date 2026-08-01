import { afterEach, describe, expect, it, vi } from 'vitest';
import { enrollOverlay, isTopOverlay } from '../policies/escape-stack.svelte';
import { closeOnEscape } from '../policies/escape.svelte';
import type { OverlayView } from '../types';

// Minimal Overlay-ish stub: identity + just what the escape behavior reads.
function fakeBond(isDisabled = false) {
	return { state: { isDisabled, close: vi.fn() } } as unknown as OverlayView;
}
const closeSpy = (bond: OverlayView) =>
	(bond as unknown as { state: { close: ReturnType<typeof vi.fn> } }).state.close;

function press(handlers: Record<string, unknown>, key: string) {
	const ev = { key, preventDefault: vi.fn() } as unknown as KeyboardEvent;
	(handlers.onkeydown as (e: Event) => void)(ev);
	return ev;
}

// Drain the stack between tests (it is module-global).
const enrolled: Array<() => void> = [];
function enroll(bond: OverlayView) {
	const off = enrollOverlay(bond);
	enrolled.push(off);
	return off;
}
afterEach(() => {
	enrolled.splice(0).forEach((off) => off());
});

describe('escape stack', () => {
	it('an empty stack lets any bond act (isTop = true)', () => {
		expect(isTopOverlay(fakeBond())).toBe(true);
	});

	it('the most-recently enrolled overlay is the top', () => {
		const a = fakeBond();
		const b = fakeBond();
		enroll(a);
		expect(isTopOverlay(a)).toBe(true);
		enroll(b);
		expect(isTopOverlay(b)).toBe(true);
		expect(isTopOverlay(a)).toBe(false);
	});

	it('an un-enrolled bond always counts as top (backward-compat)', () => {
		enroll(fakeBond()); // something else on the stack
		expect(isTopOverlay(fakeBond())).toBe(true);
	});

	it('unenrolling the top returns precedence to the one below', () => {
		const a = fakeBond();
		const b = fakeBond();
		enroll(a);
		const offB = enroll(b);
		offB();
		expect(isTopOverlay(a)).toBe(true);
	});
});

describe('escape handler gated by the stack (ADR 0009 D1)', () => {
	it('a nested (top) overlay handles Escape; its enclosing overlay no-ops', () => {
		// Simulates popover-in-Dialog: both handlers see the bubbled keydown, only the top acts.
		const dialog = fakeBond();
		const popover = fakeBond();
		enroll(dialog);
		enroll(popover); // popover opened last → top

		const dialogHandlers = closeOnEscape.behavior!('surface')!.handlers!(dialog);
		const popoverHandlers = closeOnEscape.behavior!('surface')!.handlers!(popover);

		// Innermost (top) handler runs first as the event bubbles.
		const evPopover = press(popoverHandlers, 'Escape');
		expect(evPopover.preventDefault).toHaveBeenCalled();
		expect(closeSpy(popover)).toHaveBeenCalled();

		// The same bubbling event reaches the Dialog's handler — it must NOT act.
		const evDialog = press(dialogHandlers, 'Escape');
		expect(evDialog.preventDefault).not.toHaveBeenCalled();
		expect(closeSpy(dialog)).not.toHaveBeenCalled();
	});

	it('once the top closes and unenrolls, the lower overlay handles the next Escape', () => {
		const dialog = fakeBond();
		const popover = fakeBond();
		enroll(dialog);
		const offPopover = enroll(popover);

		offPopover(); // popover closed

		const dialogHandlers = closeOnEscape.behavior!('surface')!.handlers!(dialog);
		const ev = press(dialogHandlers, 'Escape');
		expect(ev.preventDefault).toHaveBeenCalled();
		expect(closeSpy(dialog)).toHaveBeenCalled();
	});
});
