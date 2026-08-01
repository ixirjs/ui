import type { Behavior, Capability } from '../bond.svelte';
import type { OverlayView } from '../overlay/types';
import type { RovingFocus } from './roving-focus.svelte';

// `createInput` returns the InputModel surface; `inputCapability` wraps it into a
// projectable Capability for the role stitch (BondAtom.role('input', field?)).

// A reactive text field — get/set over an injected store (a bond prop).
export interface InputField {
	get(): string;
	set(value: string): void;
}

// Controller over one or more named text fields, each backed by an injected store.
// Context-agnostic: the consumer names fields and decides their meaning.
// The first field is the primary (used when name is omitted). Owns no state.
export interface InputModel {
	// A field's text (the primary field when `field` is omitted). Reactive.
	get(field?: string): string;
	// Write a field's text (the primary field when omitted).
	set(value: string, field?: string): void;
	// Clear a field (primary when omitted). Returns `true` when it had text to clear.
	clear(field?: string): boolean;
}

// Build an InputModel over named field backings; the first key is the primary field.
export function createInput(fields: Record<string, InputField>): InputModel {
	const primary = Object.keys(fields)[0]!;
	const pick = (field?: string): InputField | undefined => fields[field ?? primary];
	return {
		get: (field) => pick(field)?.get() ?? '',
		set: (value, field) => pick(field)?.set(value),
		clear: (field) => {
			const f = pick(field);
			if (!f || !f.get()) return false;
			f.set('');
			return true;
		}
	};
}

// Options for `inputCapability`'s projection.
export interface InputProjectionOptions {
	// `aria-autocomplete`. Default `'list'` (filter a list).
	autocomplete?: 'none' | 'list' | 'inline' | 'both';
	// Role whose atom id becomes `aria-controls` (the popup the input drives). Default `'container'`.
	controls?: string;
	// Map the roving `activeId` to its DOM element id for `aria-activedescendant`. Default identity.
	itemDomId?: (id: string) => string;
}

// Wrap an InputModel into a projectable Capability (slot 'input') so an editable
// control atom binds to it by role via BondAtom.role('input', field?).
// Projects the overlay-combobox a11y set (role, aria-autocomplete/expanded/controls/activedescendant).
export function inputCapability(
	model: InputModel,
	options: InputProjectionOptions = {}
): Capability<InputModel> {
	const autocomplete = options.autocomplete ?? 'list';
	const controls = options.controls ?? 'container';
	const toDomId = options.itemDomId ?? ((id: string) => id);

	return {
		slot: 'input',
		surface: model,
		behavior(role, ctx): Behavior | undefined {
			if (role !== 'input') return undefined;
			const field = ctx as string | undefined;
			return {
				attrs: (bond) => {
					const o = bond as OverlayView;
					const active = o.capability<RovingFocus>('roving')?.surface.activeId ?? null;
					return {
						role: 'combobox',
						'aria-autocomplete': autocomplete,
						'aria-expanded': o.state.isOpen,
						'aria-controls': o.atomByRole(controls)?.id,
						'aria-activedescendant': active === null ? undefined : toDomId(active),
						'aria-disabled': o.state.isDisabled,
						tabindex: o.state.isDisabled ? -1 : 0
					};
				},
				handlers: () => ({
					oninput: (ev: Event) => model.set((ev.currentTarget as HTMLInputElement).value, field)
				})
			};
		}
	};
}
