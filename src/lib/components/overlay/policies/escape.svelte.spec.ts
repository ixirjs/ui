import { describe, expect, it, vi } from 'vitest';
import { escapePolicy, closeOnEscape, ignoreEscape, clearThenClose, ESCAPE } from './escape.svelte';
import { closeOverlay } from './overlay-view';
import { INPUT } from '$ixirjs/ui/shared';
import type { OverlayView } from '$ixirjs/ui/components/overlay/types';

// Minimal Overlay-ish stub: just what the escape behavior and the handlers read.
function mockBond(options: { isDisabled?: boolean; input?: { clear: () => boolean } } = {}) {
	return {
		isDisabled: options.isDisabled ?? false,
		close: vi.fn(),
		surface: (slot: symbol) => (slot === INPUT && options.input ? options.input : undefined)
	} as unknown as OverlayView;
}

function press(handlers: Record<string, unknown>, key: string) {
	const ev = { key, preventDefault: vi.fn() } as unknown as KeyboardEvent;
	(handlers.onkeydown as (e: Event) => void)(ev);
	return ev;
}

describe('escape policy wiring', () => {
	it('closeOnEscape lives in slot "escape" with the handler as surface', () => {
		expect(closeOnEscape.slot).toBe(ESCAPE);
		expect(typeof closeOnEscape.surface).toBe('function');
		expect(closeOnEscape.meta).toMatchObject({
			projects: ['surface']
		});
	});

	it('projects only onto "surface"', () => {
		expect(closeOnEscape.behavior!('surface')).toBeDefined();
		expect(closeOnEscape.behavior!('content')).toBeUndefined();
		expect(closeOnEscape.behavior!('trigger')).toBeUndefined();
	});

	it('Escape dispatches to the handler (preventDefault + close)', () => {
		const bond = mockBond();
		const handlers = closeOnEscape.behavior!('surface')!.handlers!(bond);
		const ev = press(handlers, 'Escape');
		expect(ev.preventDefault).toHaveBeenCalled();
		expect(bond.close).toHaveBeenCalled();
	});

	it('non-Escape keys are ignored', () => {
		const bond = mockBond();
		const handlers = closeOnEscape.behavior!('surface')!.handlers!(bond);
		const ev = press(handlers, 'a');
		expect(ev.preventDefault).not.toHaveBeenCalled();
		expect(bond.close).not.toHaveBeenCalled();
	});

	it('enabled=false and disabled bonds short-circuit', () => {
		const disabledPolicy = escapePolicy(
			(b) => {
				closeOverlay(b);
			},
			{ enabled: false }
		);
		const h1 = disabledPolicy.behavior!('surface')!.handlers!(mockBond());
		const ev1 = press(h1, 'Escape');
		expect(ev1.preventDefault).not.toHaveBeenCalled();

		const disabledBond = mockBond({ isDisabled: true });
		const h2 = closeOnEscape.behavior!('surface')!.handlers!(disabledBond);
		const ev2 = press(h2, 'Escape');
		expect(ev2.preventDefault).not.toHaveBeenCalled();
		expect(disabledBond.close).not.toHaveBeenCalled();
	});
});

describe('closeOnEscape', () => {
	it('calls bond.close', () => {
		const bond = mockBond();
		closeOnEscape.surface!(bond, {} as KeyboardEvent);
		expect(bond.close).toHaveBeenCalledTimes(1);
	});
});

describe('ignoreEscape', () => {
	it('does not call bond.close', () => {
		const bond = mockBond();
		ignoreEscape.surface!(bond, {} as KeyboardEvent);
		expect(bond.close).not.toHaveBeenCalled();
	});
});

describe('clearThenClose', () => {
	it('clears input when it has text (no close)', () => {
		const clear = vi.fn().mockReturnValue(true);
		const bond = mockBond({ input: { clear } });
		clearThenClose.surface!(bond, {} as KeyboardEvent);
		expect(clear).toHaveBeenCalledTimes(1);
		expect(bond.close).not.toHaveBeenCalled();
	});

	it('closes when the input is already empty', () => {
		const clear = vi.fn().mockReturnValue(false);
		const bond = mockBond({ input: { clear } });
		clearThenClose.surface!(bond, {} as KeyboardEvent);
		expect(clear).toHaveBeenCalledTimes(1);
		expect(bond.close).toHaveBeenCalledTimes(1);
	});

	it('closes when there is no input capability', () => {
		const bond = mockBond();
		clearThenClose.surface!(bond, {} as KeyboardEvent);
		expect(bond.close).toHaveBeenCalledTimes(1);
	});
});
