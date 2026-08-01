import { describe, expect, it, vi } from 'vitest';
import {
	BACKDROP_PRESS,
	OUTSIDE_PRESS,
	backdropPressPolicy,
	handleBackdropPress,
	handleOutsidePress,
	outsidePressPolicy
} from '../policies/dismiss.svelte';
import { enrollOverlay } from '../policies/escape-stack.svelte';
import type { OverlayView } from '../types';

function event(target: EventTarget, init: Partial<MouseEvent> = {}) {
	return {
		target,
		button: init.button ?? 0,
		defaultPrevented: init.defaultPrevented ?? false,
		preventDefault: vi.fn()
	} as unknown as MouseEvent;
}

function fakeBond(initial: { open?: boolean; disabled?: boolean } = {}) {
	const content = document.createElement('div');
	const trigger = document.createElement('button');
	const backdrop = document.createElement('div');
	const outside = document.createElement('div');
	const close = vi.fn(() => {
		state.isOpen = false;
	});
	const state = {
		isOpen: initial.open ?? true,
		isDisabled: initial.disabled ?? false,
		close
	};

	return {
		bond: {
			state,
			elements: { content, trigger, backdrop }
		} as unknown as OverlayView,
		content,
		trigger,
		backdrop,
		outside,
		close
	};
}

describe('dismissal policies', () => {
	it('models outside press as a policy surface with metadata', () => {
		const cap = outsidePressPolicy();

		expect(cap.slot).toBe(OUTSIDE_PRESS);
		expect(cap.surface).toMatchObject({
			configure: expect.any(Function),
			handle: expect.any(Function)
		});
		expect(cap.meta).toMatchObject({
			layer: 1,
			kind: 'policy'
		});
	});

	it('outside press closes only when the press is outside content and trigger', () => {
		const { bond, content, trigger, outside, close } = fakeBond();

		handleOutsidePress(bond, event(content));
		handleOutsidePress(bond, event(trigger));
		expect(close).not.toHaveBeenCalled();

		handleOutsidePress(bond, event(outside));
		expect(close).toHaveBeenCalledOnce();
	});

	it('outside press runs the cancelable dismiss hook before closing', () => {
		const { bond, outside, close } = fakeBond();
		const onDismiss = vi.fn((ev: MouseEvent) => {
			Object.defineProperty(ev, 'defaultPrevented', { value: true });
		});

		handleOutsidePress(bond, event(outside), { onDismiss });

		expect(onDismiss).toHaveBeenCalledOnce();
		expect(close).not.toHaveBeenCalled();
	});

	it('backdrop press projects an onclick handler onto the backdrop role', () => {
		const cap = backdropPressPolicy();
		const { bond, backdrop, close } = fakeBond();
		const handlers = cap.behavior!('backdrop')!.handlers!(bond);

		(handlers.onclick as (ev: MouseEvent) => void)(event(backdrop));

		expect(cap.slot).toBe(BACKDROP_PRESS);
		expect(close).toHaveBeenCalledOnce();
		expect(cap.meta).toMatchObject({
			layer: 1,
			kind: 'policy',
			projects: ['backdrop']
		});
	});

	it('backdrop press ignores content clicks, disabled bonds, canceled events, and right clicks', () => {
		const { bond, content, backdrop, close } = fakeBond();

		handleBackdropPress(bond, event(content));
		handleBackdropPress(bond, event(backdrop, { defaultPrevented: true }));
		handleBackdropPress(bond, event(backdrop, { button: 2 }));
		expect(close).not.toHaveBeenCalled();

		const disabled = fakeBond({ disabled: true });
		handleBackdropPress(disabled.bond, event(disabled.backdrop));
		expect(disabled.close).not.toHaveBeenCalled();
	});

	it('press dismissal only lets the topmost enrolled overlay act', () => {
		const lower = fakeBond();
		const upper = fakeBond();
		const cleanupLower = enrollOverlay(lower.bond);
		const cleanupUpper = enrollOverlay(upper.bond);

		handleBackdropPress(lower.bond, event(lower.backdrop));
		handleBackdropPress(upper.bond, event(upper.backdrop));

		expect(lower.close).not.toHaveBeenCalled();
		expect(upper.close).toHaveBeenCalledOnce();

		cleanupUpper();
		cleanupLower();
	});
});
