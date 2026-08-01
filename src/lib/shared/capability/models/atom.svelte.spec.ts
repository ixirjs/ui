import { describe, expect, it, vi } from 'vitest';
import { Atom } from '$ixirjs/ui/shared/bond';
import {
	ariaRole,
	dataState,
	elementRef,
	focusable,
	motion,
	pressable,
	ARIA_ROLE,
	DATA_STATE,
	ELEMENT_REF,
	FOCUSABLE,
	MOTION,
	PRESSABLE
} from './atom.svelte';

type Attachment = (element: HTMLDivElement) => void | (() => void);

function mount(atom: Atom, element: HTMLDivElement): Array<() => void> {
	return Object.getOwnPropertySymbols(atom.spread)
		.map((key) => (atom.spread[key] as Attachment)(element))
		.filter((cleanup): cleanup is () => void => typeof cleanup === 'function');
}

describe('atom capability models', () => {
	it('publishes local projection metadata and atom host identity', () => {
		const capabilities = [
			elementRef(),
			pressable(),
			focusable(),
			dataState('open'),
			ariaRole('button'),
			motion()
		];

		expect(capabilities.map((capability) => capability.slot)).toEqual([
			ELEMENT_REF,
			PRESSABLE,
			FOCUSABLE,
			DATA_STATE,
			ARIA_ROLE,
			MOTION
		]);
		for (const capability of capabilities) {
			expect(capability.meta).toMatchObject({ host: 'atom' });
		}
	});

	it('projects press, focus, data-state, and role behavior on a standalone atom', () => {
		const onPress = vi.fn();
		const onFocus = vi.fn();
		const onBlur = vi.fn();
		const atom = new Atom(undefined, 'control');
		atom.capability(ariaRole('button'));
		atom.capability(dataState(true));
		atom.capability(focusable({ tabindex: 2, onFocus, onBlur }));
		atom.capability(pressable({ role: false, tabindex: false, onPress }));

		expect(atom.spread).toMatchObject({
			role: 'button',
			'data-state': '',
			'data-focusable': '',
			tabindex: 2
		});

		(atom.spread.onclick as (event: MouseEvent) => void)(new MouseEvent('click', { button: 0 }));
		(atom.spread.onkeydown as (event: KeyboardEvent) => void)(
			new KeyboardEvent('keydown', { key: 'Enter', cancelable: true })
		);
		(atom.spread.onkeydown as (event: KeyboardEvent) => void)(
			new KeyboardEvent('keydown', { key: 'Enter', repeat: true })
		);
		(atom.spread.onfocus as (event: FocusEvent) => void)(new FocusEvent('focus'));
		(atom.spread.onblur as (event: FocusEvent) => void)(new FocusEvent('blur'));

		expect(onPress).toHaveBeenCalledTimes(2);
		expect(onFocus).toHaveBeenCalledTimes(1);
		expect(onBlur).toHaveBeenCalledTimes(1);
	});

	it('runs element refs and motion hooks through stable local lifecycle attachments', () => {
		const ref = vi.fn();
		const onMount = vi.fn(() => vi.fn());
		const refAtom = new Atom(undefined, 'ref');
		refAtom.capability(elementRef(ref));
		const motionAtom = new Atom(undefined, 'motion');
		motionAtom.capability(motion({ name: 'fade', state: true, onMount }));
		const element = document.createElement('div');

		const refCleanups = mount(refAtom, element);
		const motionCleanups = mount(motionAtom, element);
		expect(ref).toHaveBeenCalledWith(element, refAtom, undefined);
		expect(motionAtom.spread).toMatchObject({
			'data-motion': 'fade',
			'data-motion-state': ''
		});
		expect(onMount).toHaveBeenCalledWith(element, motionAtom, undefined);

		for (const cleanup of [...refCleanups, ...motionCleanups].reverse()) cleanup();
		expect(ref).toHaveBeenLastCalledWith(undefined, refAtom, undefined);
		expect(onMount.mock.results[0]!.value).toHaveBeenCalledTimes(1);
	});
});
