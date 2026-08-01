import { defineProjectionCapability, sharedCapabilityKey, type Capability } from '../capability';
import { ROVING } from './roving.svelte';

// Surface type travels with the key — capability(INPUT) is typed without a cast.
export const INPUT = sharedCapabilityKey<InputModel>('@svelte-atoms/cap:input');

export interface InputField {
	get(): string;
	set(value: string): void;
}

// The first key is the primary field. Owns no state — consumers supply the backing stores.
export interface InputModel {
	// A field's text (the primary field when `field` is omitted). Reactive.
	get(field?: string): string;
	// Write a field's text (the primary field when omitted).
	set(value: string, field?: string): void;
	// Clear a field (primary when omitted). Returns `true` when it had text to clear.
	clear(field?: string): boolean;
}

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

export interface InputProjectionOptions {
	// `aria-autocomplete`. Default `'list'` (filter a list).
	autocomplete?: 'none' | 'list' | 'inline' | 'both';
	// Role whose atom id becomes `aria-controls` (the popup the input drives). Default `'container'`.
	controls?: string;
	// Map the roving `activeId` to its DOM element id for `aria-activedescendant`. Default identity.
	itemDomId?: (id: string) => string;
	// Reactive accessor for whether the controlled popup is open → `aria-expanded`. The host bond
	// supplies it (e.g. `() => this.isOpen`), keeping this capability agnostic of how a bond models
	// open/closed state. Omitted when not supplied (no `aria-expanded` is emitted).
	expanded?: () => boolean;
	// Reactive accessor for whether the control is disabled → `aria-disabled` + `tabindex`. The host
	// bond supplies it (e.g. `() => this.isDisabled`). Default `() => false`.
	disabled?: () => boolean;
}

export function inputCapability(
	model: InputModel,
	options: InputProjectionOptions = {}
): Capability<InputModel> {
	const autocomplete = options.autocomplete ?? 'list';
	const controls = options.controls ?? 'container';
	const toDomId = options.itemDomId ?? ((id: string) => id);
	const isExpanded = options.expanded;
	const isDisabled = options.disabled ?? (() => false);

	return defineProjectionCapability<InputModel>({
		slot: INPUT,
		requires: [ROVING],
		surface: model,
		meta: {
			docs: 'Input text model surface with combobox control projection.'
		},
		roles: {
			input: (field) => ({
				attrs: (bond) => {
					const active = bond.state.requireSurface(ROVING).activeId;
					const disabled = isDisabled();
					return {
						role: 'combobox',
						'aria-autocomplete': autocomplete,
						'aria-expanded': isExpanded?.(),
						'aria-controls': bond.atomByRole(controls)?.id,
						'aria-activedescendant': active === null ? undefined : toDomId(active),
						'aria-disabled': disabled,
						tabindex: disabled ? -1 : 0
					};
				},
				handlers: () => ({
					oninput: (ev: Event) => model.set((ev.currentTarget as HTMLInputElement).value, field)
				})
			})
		}
	});
}
