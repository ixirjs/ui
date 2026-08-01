import { describe, expect, it, afterEach } from 'vitest';
import { flushSync } from 'svelte';
import { useFocusRestore } from './focus-restore.svelte';
import type { OverlayView } from '../types';
import type { OverlayKnobs } from '../types';

// Validates useFocusRestore (ADR 0003): capture on closed→open, restore on open→closed, driven by bond.state.isOpen.
// Mocks only the surface the behavior reads — no full bond instantiation.

const created: HTMLElement[] = [];
function el(tag = 'button'): HTMLElement {
	const node = document.createElement(tag);
	node.tabIndex = 0;
	document.body.appendChild(node);
	created.push(node);
	return node;
}

afterEach(() => {
	created.splice(0).forEach((n) => n.remove());
});

function mockOverlay(
	focus: Pick<OverlayKnobs, 'restoreFocus' | 'captureFocusOnOpen'>,
	trigger?: HTMLElement
) {
	let open = $state(false);
	const bond = {
		// Restore config now lives on the focus capability's surface.
		capability: (slot: string) =>
			slot === 'focus'
				? { slot, surface: { strategy: undefined, ...focus } }
				: undefined,
		state: {
			get isOpen() {
				return open;
			}
		},
		element: (key: string) => (key === 'trigger' ? trigger : undefined)
	} as unknown as OverlayView;
	return {
		bond,
		setOpen: (v: boolean) => {
			open = v;
		}
	};
}

describe('useFocusRestore', () => {
	it("restoreFocus: 'previous' captures the pre-open element and restores it on close", () => {
		const previous = el();
		const inside = el('input');
		const { bond, setOpen } = mockOverlay({ restoreFocus: 'previous', captureFocusOnOpen: true });

		previous.focus();
		expect(document.activeElement).toBe(previous);

		const dispose = $effect.root(() => {
			useFocusRestore(bond);
		});
		flushSync();

		// Open: $effect.pre snapshots `previous` before focus moves inside.
		setOpen(true);
		flushSync();
		inside.focus(); // overlay's focus-in moves focus into the content
		expect(document.activeElement).toBe(inside);

		// Close (however triggered): focus returns to the captured element.
		setOpen(false);
		flushSync();
		expect(document.activeElement).toBe(previous);

		dispose();
	});

	it("restoreFocus: 'trigger' restores to the trigger element regardless of prior focus", () => {
		const trigger = el();
		const elsewhere = el();
		const { bond, setOpen } = mockOverlay({ restoreFocus: 'trigger' }, trigger);

		elsewhere.focus();
		const dispose = $effect.root(() => useFocusRestore(bond));
		flushSync();

		setOpen(true);
		flushSync();
		setOpen(false);
		flushSync();
		expect(document.activeElement).toBe(trigger);

		dispose();
	});

	it("restoreFocus: 'none' does not move focus on close", () => {
		const inside = el('input');
		const { bond, setOpen } = mockOverlay({ restoreFocus: 'none' });

		const dispose = $effect.root(() => useFocusRestore(bond));
		flushSync();

		setOpen(true);
		flushSync();
		inside.focus();
		setOpen(false);
		flushSync();
		expect(document.activeElement).toBe(inside); // untouched

		dispose();
	});

	it('does not steal focus on initial mount while closed', () => {
		const trigger = el();
		const elsewhere = el();
		const { bond } = mockOverlay({ restoreFocus: 'trigger' }, trigger);

		elsewhere.focus();
		const dispose = $effect.root(() => useFocusRestore(bond));
		flushSync();

		expect(document.activeElement).toBe(elsewhere); // never restored — was never open

		dispose();
	});

	it('captureFocusOnOpen: false leaves nothing to restore (previous stays null)', () => {
		const previous = el();
		const inside = el('input');
		const { bond, setOpen } = mockOverlay({ restoreFocus: 'previous', captureFocusOnOpen: false });

		previous.focus();
		const dispose = $effect.root(() => useFocusRestore(bond));
		flushSync();

		setOpen(true);
		flushSync();
		inside.focus();
		setOpen(false);
		flushSync();
		expect(document.activeElement).toBe(inside); // no capture -> no restore target -> no-op

		dispose();
	});
});
