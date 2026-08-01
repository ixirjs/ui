import {
	defineCapability,
	sharedCapabilityKey,
	type Capability
} from '$ixirjs/ui/shared/capability/capability';
import type { Bond } from '$ixirjs/ui/shared/bond';
import { DISCLOSURE } from '$ixirjs/ui/shared/capability/models/disclosure.svelte';
import {
	clearKnownSurfaces,
	isDisabled,
	shouldSkipPolicy,
	type PolicyAction,
	type PolicyGuard
} from '$ixirjs/ui/shared/capability/models/interaction-policies/shared';

export const FOCUS_TRIGGER = sharedCapabilityKey<void>({
	owner: '@ixirjs/cap',
	name: 'focus-trigger',
	version: 1
});
export const ACTIVATION_POLICY = sharedCapabilityKey<void>({
	owner: '@ixirjs/cap',
	name: 'activation-policy',
	version: 1
});
export const CLEAR_POLICY = sharedCapabilityKey<void>({
	owner: '@ixirjs/cap',
	name: 'clear-policy',
	version: 1
});

export interface ActivationPolicyOptions {
	role?: string;
	onActivate: PolicyAction;
	keys?: readonly string[] | false;
	event?: 'click' | 'pointerdown' | false;
	disabled?: PolicyGuard;
	preventDefaultOnKeys?: boolean;
	buttonAttrs?: boolean;
}

export function activationPolicy(options: ActivationPolicyOptions): Capability<void> {
	const role = options.role ?? 'control';
	const keys = options.keys ?? ['Enter', ' '];
	const eventName = options.event ?? 'click';
	const buttonAttrs = options.buttonAttrs ?? true;

	return defineCapability<void>({
		slot: ACTIVATION_POLICY,
		meta: {
			projects: [role],
			docs: 'Generic button-like click and keyboard activation policy.'
		},
		behavior: (projectedRole) =>
			projectedRole === role
				? {
						attrs: (bond) => {
							const disabled = isDisabled(options.disabled, bond);
							return {
								...(buttonAttrs ? { role: 'button', tabindex: disabled ? -1 : 0 } : {}),
								'aria-disabled': disabled ? 'true' : undefined,
								'data-disabled': disabled ? '' : undefined
							};
						},
						handlers: (bond) => {
							const handlers: Record<string, unknown> = {};
							if (eventName) {
								handlers[`on${eventName}`] = (event: Event) => {
									if (shouldSkipPolicy(options.disabled, bond, event)) return;
									options.onActivate(bond, event);
								};
							}
							if (keys) {
								handlers.onkeydown = (event: KeyboardEvent) => {
									if (!keys.includes(event.key)) return;
									if (shouldSkipPolicy(options.disabled, bond, event)) return;
									if (options.preventDefaultOnKeys ?? true) event.preventDefault();
									options.onActivate(bond, event);
								};
							}
							return handlers;
						}
					}
				: undefined
	});
}

export interface FocusTriggerOptions {
	role?: string;
	open?: PolicyAction<FocusEvent>;
	close?: PolicyAction<FocusEvent>;
	closeDelay?: number;
	disabled?: PolicyGuard;
}

export function focusTrigger(options: FocusTriggerOptions = {}): Capability<void> {
	const role = options.role ?? 'trigger';
	const closeDelay = options.closeDelay ?? 0;
	let closeTimer: ReturnType<typeof setTimeout> | undefined;

	const clearClose = () => {
		if (closeTimer !== undefined) clearTimeout(closeTimer);
		closeTimer = undefined;
	};

	return defineCapability<void>({
		slot: FOCUS_TRIGGER,
		...(options.open || options.close ? {} : { requires: [DISCLOSURE] }),
		meta: {
			projects: [role],
			docs: 'Focus trigger policy that opens on focus and closes or schedules close on blur.'
		},
		behavior: (projectedRole) =>
			projectedRole === role
				? {
						handlers: (bond) => ({
							onfocusin: (event: FocusEvent) => {
								clearClose();
								if (shouldSkipPolicy(options.disabled, bond, event)) return;
								if (options.open) options.open(bond, event);
								else bond.requireSurface(DISCLOSURE).open();
							},
							onfocusout: (event: FocusEvent) => {
								clearClose();
								if (shouldSkipPolicy(options.disabled, bond, event)) return;
								const close = () => {
									if (options.close) options.close(bond, event);
									else bond.requireSurface(DISCLOSURE).close();
								};
								if (closeDelay > 0) closeTimer = setTimeout(close, closeDelay);
								else close();
							}
						}),
						onmount: () => clearClose
					}
				: undefined
	});
}

export interface ClearPolicyOptions {
	role?: string;
	clear?: PolicyAction;
	field?: string;
	keys?: readonly string[] | false;
	event?: 'click' | 'pointerdown' | false;
	disabled?: PolicyGuard;
	buttonAttrs?: boolean;
}

export function clearPolicy(options: ClearPolicyOptions = {}): Capability<void> {
	const role = options.role ?? 'clear';
	const keys = options.keys ?? ['Enter', ' '];
	const eventName = options.event ?? 'click';
	const buttonAttrs = options.buttonAttrs ?? true;
	const clear = (bond: Bond, event: Event) => {
		if (options.clear) {
			options.clear(bond, event);
			return;
		}
		clearKnownSurfaces(bond, options.field);
	};

	return defineCapability<void>({
		slot: CLEAR_POLICY,
		meta: {
			projects: [role],
			docs: 'Generic policy for clearing a value, query, or selection.'
		},
		behavior: (projectedRole) =>
			projectedRole === role
				? {
						attrs: (bond) => {
							const disabled = isDisabled(options.disabled, bond);
							return {
								...(buttonAttrs ? { role: 'button', tabindex: disabled ? -1 : 0 } : {}),
								'aria-disabled': disabled ? 'true' : undefined,
								'data-disabled': disabled ? '' : undefined
							};
						},
						handlers: (bond) => {
							const handlers: Record<string, unknown> = {};
							if (eventName) {
								handlers[`on${eventName}`] = (event: Event) => {
									if (shouldSkipPolicy(options.disabled, bond, event)) return;
									clear(bond, event);
								};
							}
							if (keys) {
								handlers.onkeydown = (event: KeyboardEvent) => {
									if (!keys.includes(event.key)) return;
									if (shouldSkipPolicy(options.disabled, bond, event)) return;
									event.preventDefault();
									clear(bond, event);
								};
							}
							return handlers;
						}
					}
				: undefined
	});
}
