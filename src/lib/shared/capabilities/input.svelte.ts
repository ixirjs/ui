import { sharedCapabilityKey, type Behavior, type Capability } from '../bond.svelte';
import { ROVING } from './roving-focus.svelte';

// Public slot key — surface type travels with the key, so `capability(INPUT)` is typed (no cast).
export const INPUT = sharedCapabilityKey<InputModel>('@svelte-atoms/cap:input');

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
	// Reactive accessor for whether the controlled popup is open → `aria-expanded`. The host bond
	// supplies it (e.g. `() => this.isOpen`), keeping this capability agnostic of how a bond models
	// open/closed state. Omitted when not supplied (no `aria-expanded` is emitted).
	expanded?: () => boolean;
	// Reactive accessor for whether the control is disabled → `aria-disabled` + `tabindex`. The host
	// bond supplies it (e.g. `() => this.isDisabled`). Default `() => false`.
	disabled?: () => boolean;
}

// Wrap an InputModel into a projectable Capability (slot 'input'); role 'input' binds an editable
// control and projects the overlay-combobox a11y set (role, aria-autocomplete/expanded/controls/activedescendant).
export function inputCapability(
	model: InputModel,
	options: InputProjectionOptions = {}
): Capability<InputModel> {
	const autocomplete = options.autocomplete ?? 'list';
	const controls = options.controls ?? 'container';
	const toDomId = options.itemDomId ?? ((id: string) => id);
	const isExpanded = options.expanded;
	const isDisabled = options.disabled ?? (() => false);

	return {
		slot: INPUT,
		// Reads the roving capability's activeId for aria-activedescendant.
		requires: [ROVING],
		surface: model,
		behavior(role, ctx): Behavior | undefined {
			if (role !== 'input') return undefined;
			const field = ctx as string | undefined;
			return {
				// `bond` stays the base Bond — `capability`/`atomByRole` are base-Bond methods and the
				// open/disabled state arrives via injected accessors, so no bond shape is assumed.
				attrs: (bond) => {
					const active = bond.capability(ROVING)?.surface?.activeId ?? null;
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
			};
		}
	};
}
