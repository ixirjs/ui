import {
	defineAtomCapability,
	sharedCapabilityKey,
	type AtomCapability,
	type AtomHost
} from '../capability';
import type { Bond, BondVirtualElement } from '../../bond';

export type AtomValue<T> = T | ((node: AtomHost, bond: Bond | undefined) => T);
export type AtomElement = Element | BondVirtualElement;
export type AtomTeardown = Disposable | (() => void) | void;

export const ELEMENT_REF = sharedCapabilityKey<void>('@svelte-atoms/atom:element-ref');
export const PRESSABLE = sharedCapabilityKey<void>('@svelte-atoms/atom:pressable');
export const FOCUSABLE = sharedCapabilityKey<void>('@svelte-atoms/atom:focusable');
export const DATA_STATE = sharedCapabilityKey<void>('@svelte-atoms/atom:data-state');
export const ARIA_ROLE = sharedCapabilityKey<void>('@svelte-atoms/atom:aria-role');
export const MOTION = sharedCapabilityKey<void>('@svelte-atoms/atom:motion');

export type ElementRefCallback = (
	element: AtomElement | undefined,
	node: AtomHost,
	bond: Bond | undefined
) => void;

export interface ElementRefOptions {
	ref?: ElementRefCallback;
}

export function elementRef(
	options: ElementRefOptions | ElementRefCallback = {}
): AtomCapability<void> {
	const ref = typeof options === 'function' ? options : options.ref;
	return defineAtomCapability<void>({
		slot: ELEMENT_REF,
		meta: {
			layer: 1,
			kind: 'projection',
			docs: 'Atom-local mounted element reference callback.'
		},
		...(ref
			? {
					behavior: {
						onmount(element, node, bond) {
							ref(element, node, bond);
							return () => ref(undefined, node, bond);
						}
					}
				}
			: {})
	});
}

export interface PressableOptions {
	disabled?: AtomValue<boolean | undefined>;
	role?: AtomValue<string | false | null | undefined>;
	tabindex?: AtomValue<number | false | null | undefined>;
	keys?: readonly string[] | false;
	preventDefaultOnKeys?: boolean;
	stopPropagation?: boolean;
	onPress?(event: MouseEvent | KeyboardEvent, node: AtomHost, bond: Bond | undefined): void;
}

export function pressable(options: PressableOptions = {}): AtomCapability<void> {
	const keys = options.keys ?? ['Enter', ' '];
	return defineAtomCapability<void>({
		slot: PRESSABLE,
		meta: {
			layer: 1,
			kind: 'policy',
			projects: ['press'],
			docs: 'Atom-local press activation behavior for button-like parts.'
		},
		behavior: {
			attrs: (node, bond) => {
				const disabled = Boolean(readNodeValue(options.disabled, node, bond));
				const role = readNodeValue(options.role ?? 'button', node, bond);
				const tabindex = readNodeValue(options.tabindex ?? 0, node, bond);
				const tabindexAttr = disabled
					? -1
					: tabindex === false || tabindex == null
						? undefined
						: tabindex;
				return {
					...(role ? { role } : {}),
					'aria-disabled': disabled ? 'true' : undefined,
					'data-disabled': disabled ? '' : undefined,
					...(tabindexAttr !== undefined ? { tabindex: tabindexAttr } : {})
				};
			},
			handlers: (node, bond) => ({
				onclick: (event: MouseEvent) => {
					if (shouldSkipPress(event, node, bond, options)) return;
					if (options.stopPropagation) event.stopPropagation();
					options.onPress?.(event, node, bond);
				},
				onkeydown: (event: KeyboardEvent) => {
					if (!keys || !keys.includes(event.key)) return;
					if (shouldSkipPress(event, node, bond, options)) return;
					if (options.preventDefaultOnKeys ?? true) event.preventDefault();
					if (options.stopPropagation) event.stopPropagation();
					options.onPress?.(event, node, bond);
				}
			})
		}
	});
}

export interface FocusableOptions {
	disabled?: AtomValue<boolean | undefined>;
	tabindex?: AtomValue<number | false | null | undefined>;
	onFocus?(event: FocusEvent, node: AtomHost, bond: Bond | undefined): void;
	onBlur?(event: FocusEvent, node: AtomHost, bond: Bond | undefined): void;
}

export function focusable(options: FocusableOptions = {}): AtomCapability<void> {
	return defineAtomCapability<void>({
		slot: FOCUSABLE,
		meta: {
			layer: 1,
			kind: 'projection',
			projects: ['focus'],
			docs: 'Atom-local focusability projection and focus/blur hooks.'
		},
		behavior: {
			attrs: (node, bond) => {
				const disabled = Boolean(readNodeValue(options.disabled, node, bond));
				const tabindex = readNodeValue(options.tabindex ?? 0, node, bond);
				const tabindexAttr = disabled
					? -1
					: tabindex === false || tabindex == null
						? undefined
						: tabindex;
				return {
					'data-focusable': disabled ? undefined : '',
					...(tabindexAttr !== undefined ? { tabindex: tabindexAttr } : {})
				};
			},
			handlers: (node, bond) => ({
				onfocus: (event: FocusEvent) => options.onFocus?.(event, node, bond),
				onblur: (event: FocusEvent) => options.onBlur?.(event, node, bond)
			})
		}
	});
}

export interface DataStateOptions {
	attr?: `data-${string}`;
}

export function dataState(
	state: AtomValue<string | boolean | null | undefined>,
	options: DataStateOptions = {}
): AtomCapability<void> {
	const attr = options.attr ?? 'data-state';
	return defineAtomCapability<void>({
		slot: DATA_STATE,
		meta: {
			layer: 1,
			kind: 'projection',
			projects: [attr],
			docs: 'Atom-local data state projection for styling and CSS animation hooks.'
		},
		behavior: {
			attrs: (node, bond) => ({ [attr]: normalizeDataValue(readNodeValue(state, node, bond)) })
		}
	});
}

export function ariaRole(role: AtomValue<string | null | undefined>): AtomCapability<void> {
	return defineAtomCapability<void>({
		slot: ARIA_ROLE,
		meta: {
			layer: 1,
			kind: 'projection',
			projects: ['role'],
			docs: 'Atom-local ARIA role projection.'
		},
		behavior: {
			attrs: (node, bond) => ({ role: readNodeValue(role, node, bond) ?? undefined })
		}
	});
}

export interface MotionOptions {
	name?: AtomValue<string | null | undefined>;
	state?: AtomValue<string | boolean | null | undefined>;
	onMount?(element: AtomElement, node: AtomHost, bond: Bond | undefined): AtomTeardown;
}

export function motion(options: MotionOptions = {}): AtomCapability<void> {
	return defineAtomCapability<void>({
		slot: MOTION,
		meta: {
			layer: 1,
			kind: 'effect',
			projects: ['motion'],
			docs: 'Atom-local motion hook and data attributes for animation hosts.'
		},
		behavior: {
			attrs: (node, bond) => {
				const name = readNodeValue(options.name, node, bond);
				const state = readNodeValue(options.state, node, bond);
				return {
					...(name ? { 'data-motion': name } : {}),
					'data-motion-state': normalizeDataValue(state)
				};
			},
			...(options.onMount
				? {
						onmount(element, node, bond) {
							return toTeardown(options.onMount!(element, node, bond));
						}
					}
				: {})
		}
	});
}

function readNodeValue<T>(
	value: AtomValue<T> | undefined,
	node: AtomHost,
	bond: Bond | undefined
): T | undefined {
	return typeof value === 'function'
		? (value as (node: AtomHost, bond: Bond | undefined) => T)(node, bond)
		: value;
}

function normalizeDataValue(value: string | boolean | null | undefined): string | undefined {
	if (value === true) return '';
	if (value === false || value == null) return undefined;
	return value;
}

function shouldSkipPress(
	event: MouseEvent | KeyboardEvent,
	node: AtomHost,
	bond: Bond | undefined,
	options: PressableOptions
): boolean {
	if (event.defaultPrevented) return true;
	if ('button' in event && event.button === 2) return true;
	return Boolean(readNodeValue(options.disabled, node, bond));
}

function toTeardown(live: AtomTeardown): void | (() => void) {
	if (!live) return;
	if (typeof live === 'function') return live;
	return () => live[Symbol.dispose]();
}
