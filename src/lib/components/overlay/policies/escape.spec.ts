import { describe, expect, it, vi } from 'vitest';
import { closeOnEscape, ignoreEscape, clearThenClose } from './escape.svelte';
import { INPUT } from '$ixirjs/ui/shared';
import type { OverlayView } from '$ixirjs/ui/components/overlay/types';

function mockBond(input?: { clear: () => boolean }) {
	return {
		close: vi.fn(),
		surface: (slot: symbol) => (slot === INPUT && input ? input : undefined)
	} as unknown as OverlayView;
}

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
		const bond = mockBond({ clear });
		clearThenClose.surface!(bond, {} as KeyboardEvent);
		expect(clear).toHaveBeenCalledTimes(1);
		expect(bond.close).not.toHaveBeenCalled();
	});

	it('closes when the input is already empty', () => {
		const clear = vi.fn().mockReturnValue(false);
		const bond = mockBond({ clear });
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
