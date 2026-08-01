import { describe, expect, it, vi } from 'vitest';
import { closeOnEscape, ignoreEscape, clearThenClose } from './escape.svelte';
import { INPUT } from '$svelte-atoms/core/shared';
import type { OverlayView } from '../types';

function mockBond(input?: { clear: () => boolean }) {
	const state = {
		close: vi.fn(),
		// clearThenClose now reads via the canonical state.surface() accessor (#3).
		surface: (slot: symbol) => (slot === INPUT && input ? input : undefined)
	};
	return {
		state
	} as unknown as OverlayView & { state: typeof state };
}

describe('closeOnEscape', () => {
	it('calls bond.state.close', () => {
		const bond = mockBond();
		closeOnEscape.surface!(bond, {} as KeyboardEvent);
		expect(bond.state.close).toHaveBeenCalledTimes(1);
	});
});

describe('ignoreEscape', () => {
	it('does not call bond.state.close', () => {
		const bond = mockBond();
		ignoreEscape.surface!(bond, {} as KeyboardEvent);
		expect(bond.state.close).not.toHaveBeenCalled();
	});
});

describe('clearThenClose', () => {
	it('clears input when it has text (no close)', () => {
		const clear = vi.fn().mockReturnValue(true);
		const bond = mockBond({ clear });
		clearThenClose.surface!(bond, {} as KeyboardEvent);
		expect(clear).toHaveBeenCalledTimes(1);
		expect(bond.state.close).not.toHaveBeenCalled();
	});

	it('closes when the input is already empty', () => {
		const clear = vi.fn().mockReturnValue(false);
		const bond = mockBond({ clear });
		clearThenClose.surface!(bond, {} as KeyboardEvent);
		expect(clear).toHaveBeenCalledTimes(1);
		expect(bond.state.close).toHaveBeenCalledTimes(1);
	});

	it('closes when there is no input capability', () => {
		const bond = mockBond();
		clearThenClose.surface!(bond, {} as KeyboardEvent);
		expect(bond.state.close).toHaveBeenCalledTimes(1);
	});
});
