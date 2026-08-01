import { describe, expect, it, vi } from 'vitest';
import { escapePolicy, closeOnEscape } from '../policies/escape.svelte';
import type { OverlayView } from '../types';

// Minimal Overlay-ish stub: just what the escape behavior reads.
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

describe('escape policies', () => {
	it('closeOnEscape lives in slot "escape" with the handler as surface', () => {
		expect(closeOnEscape.slot).toBe('escape');
		expect(typeof closeOnEscape.surface).toBe('function');
	});

	it('projects only onto "surface"', () => {
		expect(closeOnEscape.behavior!('surface')).toBeDefined();
		expect(closeOnEscape.behavior!('content')).toBeUndefined();
		expect(closeOnEscape.behavior!('trigger')).toBeUndefined();
	});

	it('Escape dispatches to the handler (preventDefault + close)', () => {
		const bond = fakeBond();
		const handlers = closeOnEscape.behavior!('surface')!.handlers!(bond);
		const ev = press(handlers, 'Escape');
		expect(ev.preventDefault).toHaveBeenCalled();
		expect(closeSpy(bond)).toHaveBeenCalled();
	});

	it('non-Escape keys are ignored', () => {
		const bond = fakeBond();
		const handlers = closeOnEscape.behavior!('surface')!.handlers!(bond);
		const ev = press(handlers, 'a');
		expect(ev.preventDefault).not.toHaveBeenCalled();
		expect(closeSpy(bond)).not.toHaveBeenCalled();
	});

	it('enabled=false and disabled bonds short-circuit', () => {
		const disabledPolicy = escapePolicy((b) => { b.state.close(); }, { enabled: false });
		const h1 = disabledPolicy.behavior!('surface')!.handlers!(fakeBond());
		const ev1 = press(h1, 'Escape');
		expect(ev1.preventDefault).not.toHaveBeenCalled();

		const disabledBond = fakeBond(true);
		const h2 = closeOnEscape.behavior!('surface')!.handlers!(disabledBond);
		const ev2 = press(h2, 'Escape');
		expect(ev2.preventDefault).not.toHaveBeenCalled();
		expect(closeSpy(disabledBond)).not.toHaveBeenCalled();
	});
});
