import {
	defineModelCapability,
	definePolicyCapability,
	sharedCapabilityKey,
	type Capability
} from '../capability';
import type { Bond } from '../../bond';
import { createSelection } from './selection.svelte';

// Disclosure — open/closed state as a degenerate SelectionModel over {self}.
// open ≡ self is selected; thin facade (open/close/toggle/isOpen) reuses the selection algebra.
export interface Disclosure {
	readonly isOpen: boolean;
	open(): void;
	close(): void;
	toggle(): void;
}

// Boolean storage seam — the bond supplies reactive accessors over `props.open`.
export interface DisclosureBacking {
	get(): boolean;
	set(open: boolean): void;
}

export const DISCLOSURE = sharedCapabilityKey<Disclosure>('@svelte-atoms/cap:disclosure');
export const DISCLOSURE_TRIGGER = sharedCapabilityKey<void>('@svelte-atoms/cap:disclosure-trigger');
export const DISCLOSURE_CLOSE = sharedCapabilityKey<void>('@svelte-atoms/cap:disclosure-close');
export const DISCLOSURE_TOGGLE = sharedCapabilityKey<void>('@svelte-atoms/cap:disclosure-toggle');

export type DisclosureActivationAction = 'open' | 'close' | 'toggle';
export type DisclosureActivationEvent = 'click' | 'pointerdown' | false;

export interface DisclosureActivationOptions {
	role?: string;
	action?: DisclosureActivationAction | DisclosureActivationHandler;
	event?: DisclosureActivationEvent;
	keys?: readonly string[] | false;
	disabled?: boolean | DisclosureActivationGuard;
	preventDefaultOnKeys?: boolean;
	stopPropagation?: boolean;
}

export type DisclosureActivationGuard = (bond: Bond) => boolean;
export type DisclosureActivationHandler = (
	disclosure: Disclosure,
	bond: Bond,
	event: Event
) => void;

// The sentinel "value" whose selectedness is the open state.
const SELF = 'open';

// Build a Disclosure as a single-mode createSelection over {SELF}.
// The boolean backing adapts to the array surface: open ↔ [SELF].
export function createDisclosure(backing: DisclosureBacking): Disclosure {
	const selection = createSelection<string>({
		get: () => (backing.get() ? [SELF] : []),
		set: (values) => backing.set(values.length > 0),
		mode: () => 'single'
	});

	return {
		get isOpen() {
			return selection.isSelected(SELF);
		},
		open: () => selection.select(SELF),
		close: () => selection.deselect(SELF),
		toggle: () => selection.toggle(SELF)
	};
}

export function disclosureCapability(disclosure: Disclosure): Capability<Disclosure> {
	return defineModelCapability<Disclosure>({
		slot: DISCLOSURE,
		surface: disclosure,
		meta: {
			docs: 'Open/close/toggle disclosure model surface.'
		}
	});
}

export function disclosureTrigger(options: DisclosureActivationOptions = {}): Capability<void> {
	return disclosureActivationCapability(DISCLOSURE_TRIGGER, {
		role: 'trigger',
		action: 'toggle',
		docs: 'Activation policy for disclosure trigger roles.',
		...options
	});
}

export function disclosureClose(options: DisclosureActivationOptions = {}): Capability<void> {
	return disclosureActivationCapability(DISCLOSURE_CLOSE, {
		role: 'close',
		action: 'close',
		docs: 'Activation policy for disclosure close roles.',
		...options
	});
}

export function disclosureToggle(options: DisclosureActivationOptions = {}): Capability<void> {
	return disclosureActivationCapability(DISCLOSURE_TOGGLE, {
		role: 'toggle',
		action: 'toggle',
		docs: 'Activation policy for disclosure toggle roles.',
		...options
	});
}

type DisclosureActivationDefaults = DisclosureActivationOptions & {
	action: DisclosureActivationAction | DisclosureActivationHandler;
	docs: string;
	role: string;
};

const DEFAULT_KEYS = ['Enter', ' '] as const;

function disclosureActivationCapability(
	slot: symbol,
	options: DisclosureActivationDefaults
): Capability<void> {
	const role = options.role;
	const eventName = options.event ?? 'click';
	const keys = options.keys ?? DEFAULT_KEYS;

	return definePolicyCapability<void>({
		slot,
		requires: [DISCLOSURE],
		meta: {
			projects: [role],
			docs: options.docs
		},
		behavior: (projectedRole) =>
			projectedRole === role
				? {
						handlers: (bond) => {
							const handlers: Record<string, unknown> = {};
							if (eventName) {
								handlers[`on${eventName}`] = (ev: Event) => {
									if (shouldSkipActivation(bond, ev, options)) return;
									activateDisclosure(bond, ev, options);
								};
							}
							if (keys) {
								handlers.onkeydown = (ev: KeyboardEvent) => {
									if (!keys.includes(ev.key)) return;
									if (shouldSkipActivation(bond, ev, options)) return;
									if (options.preventDefaultOnKeys ?? true) ev.preventDefault();
									activateDisclosure(bond, ev, options);
								};
							}
							return handlers;
						}
					}
				: undefined
	});
}

function shouldSkipActivation(
	bond: Bond,
	event: Event,
	options: DisclosureActivationDefaults
): boolean {
	if (event.defaultPrevented) return true;
	if ('button' in event && event.button === 2) return true;
	if (isDisclosureActivationDisabled(bond, options.disabled)) return true;
	return false;
}

function isDisclosureActivationDisabled(
	bond: Bond,
	guard: DisclosureActivationOptions['disabled']
): boolean {
	if (typeof guard === 'boolean') return guard;
	if (typeof guard === 'function') return guard(bond);

	const state = bond.state as { isDisabled?: boolean; props?: { disabled?: boolean } };
	return Boolean(state.isDisabled ?? state.props?.disabled ?? false);
}

function activateDisclosure(bond: Bond, event: Event, options: DisclosureActivationDefaults): void {
	if (options.stopPropagation) event.stopPropagation();

	const disclosure = bond.state.requireSurface(DISCLOSURE);
	const action = options.action;
	if (typeof action === 'function') {
		action(disclosure, bond, event);
		return;
	}
	switch (action) {
		case 'open':
			disclosure.open();
			return;
		case 'close':
			disclosure.close();
			return;
		case 'toggle':
			disclosure.toggle();
			return;
	}
}
