import { describe, expect, it, vi } from 'vitest';
import { clickTrigger, hoverTrigger, contextMenuTrigger, manualTrigger } from './trigger.svelte';
import type { OverlayView } from '../types';

function mockBond(isOpen = false, isDisabled = false) {
	const state = { open: vi.fn(), close: vi.fn(), toggle: vi.fn(), isOpen, isDisabled };
	return { id: 'b1', namespace: 'popover', state } as unknown as OverlayView & {
		state: typeof state;
	};
}

describe('clickTrigger', () => {
	it('onclick toggles', () => {
		const bond = mockBond();
		const h = clickTrigger().behavior!('trigger')!.handlers!(bond);
		(h.onclick as (ev: MouseEvent) => void)({ button: 0, defaultPrevented: false } as MouseEvent);
		expect(bond.state.toggle).toHaveBeenCalledTimes(1);
	});

	it('onclick ignores right-click', () => {
		const bond = mockBond();
		const h = clickTrigger().behavior!('trigger')!.handlers!(bond);
		(h.onclick as (ev: MouseEvent) => void)({ button: 2, defaultPrevented: false } as MouseEvent);
		expect(bond.state.toggle).not.toHaveBeenCalled();
	});

	it('onclick ignores defaultPrevented events', () => {
		const bond = mockBond();
		const h = clickTrigger().behavior!('trigger')!.handlers!(bond);
		(h.onclick as (ev: MouseEvent) => void)({ button: 0, defaultPrevented: true } as MouseEvent);
		expect(bond.state.toggle).not.toHaveBeenCalled();
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
		expect(bond.state.toggle).toHaveBeenCalledTimes(2);
		expect(prevent).toHaveBeenCalledTimes(2);
	});

	it('Tab does NOT toggle', () => {
		const bond = mockBond();
		const h = clickTrigger().behavior!('trigger')!.handlers!(bond);
		(h.onkeydown as (ev: KeyboardEvent) => void)({
			key: 'Tab',
			preventDefault: () => undefined
		} as unknown as KeyboardEvent);
		expect(bond.state.toggle).not.toHaveBeenCalled();
	});
});

describe('hoverTrigger', () => {
	it('opens after openDelay ms on pointer-enter', () => {
		vi.useFakeTimers();
		const bond = mockBond();
		const b = hoverTrigger({ openDelay: 50, closeDelay: 50 }).behavior!('trigger')!;
		const h = b.handlers!(bond) as { onpointerenter: () => void };
		h.onpointerenter();
		expect(bond.state.open).not.toHaveBeenCalled();
		vi.advanceTimersByTime(50);
		expect(bond.state.open).toHaveBeenCalledTimes(1);
		vi.useRealTimers();
	});

	it('closes after closeDelay ms on pointer-leave', () => {
		vi.useFakeTimers();
		const bond = mockBond();
		const b = hoverTrigger({ openDelay: 50, closeDelay: 100 }).behavior!('trigger')!;
		const h = b.handlers!(bond) as { onpointerleave: () => void };
		h.onpointerleave();
		expect(bond.state.close).not.toHaveBeenCalled();
		vi.advanceTimersByTime(100);
		expect(bond.state.close).toHaveBeenCalledTimes(1);
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
		expect(bond.state.open).not.toHaveBeenCalled();
		vi.advanceTimersByTime(50); // closeDelay fires
		expect(bond.state.close).toHaveBeenCalledTimes(1);
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
		expect(bond.state.open).not.toHaveBeenCalled();
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
		expect(bond.state.open).toHaveBeenCalledTimes(1);
	});
});

describe('manualTrigger', () => {
	it('has no handlers (programmatic control only)', () => {
		expect(manualTrigger().behavior!('trigger')!.handlers).toBeUndefined();
	});
});
