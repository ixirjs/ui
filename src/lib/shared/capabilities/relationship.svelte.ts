import { capabilityKey, sharedCapabilityKey, type Behavior, type Capability } from '../bond.svelte';
import type { Disclosure } from './disclosure.svelte';

// Public slot key — surface type travels with the key, so `capability(TRIGGER_CONTENT)` is typed.
export const TRIGGER_CONTENT = sharedCapabilityKey<Disclosure>('@svelte-atoms/cap:trigger-content');

// Private slot key (not exported from the public barrel): labelledControl is a behavior-only linkage
// nobody retrieves by key, so it stays unforgeable — the private seam (#2). ADR 0005 D6.
export const LABELLED = capabilityKey('labelled');

// Reusable a11y linkage between roles. Where atoms must cross-reference each other's ids
// (label/control, trigger/content, tab/tabpanel, …), the wiring resolves siblings via
// `bond.atomByRole(role)`. See docs/extensibility-vision.md §11.3.

export interface TriggerContentOptions {
	// `aria-haspopup` on the trigger (menus, listboxes, dialogs). Omitted by default.
	haspopup?: 'menu' | 'listbox' | 'dialog' | 'grid' | 'tree' | true;
	// ARIA role for the content (e.g. `'region'` for accordion/collapsible).
	contentRole?: string;
}

// Trigger ↔ content disclosure linkage — the most repeated a11y pattern.
// 'trigger' → aria-controls + aria-expanded (+ optional aria-haspopup).
// 'content' → aria-labelledby (+ optional role). Slot 'trigger-content'.
export function triggerContentLink(
	disclosure: Disclosure,
	options: TriggerContentOptions = {}
): Capability<Disclosure> {
	return {
		slot: TRIGGER_CONTENT,
		surface: disclosure,
		behavior(role): Behavior | undefined {
			if (role === 'trigger') {
				return {
					attrs: (bond) => ({
						'aria-controls': bond.atomByRole('content')?.id,
						'aria-expanded': disclosure.isOpen,
						...(options.haspopup ? { 'aria-haspopup': options.haspopup } : {})
					})
				};
			}
			if (role === 'content') {
				return {
					attrs: (bond) => ({
						'aria-labelledby': bond.atomByRole('trigger')?.id,
						...(options.contentRole ? { role: options.contentRole } : {})
					})
				};
			}
			return undefined;
		}
	};
}

// Options for `labelledControl`.
export interface LabelledControlOptions {
	// Also emit a native `for` attr for real <label>/<input> pairs (default: aria-labelledby only).
	nativeFor?: boolean;
}

// Label/description → control linkage for the form-field pattern. Projects onto 'control'
// the ARIA references to its label and description siblings; each reference is omitted when
// the sibling is absent. Slot 'labelled'.
export function labelledControl(options: LabelledControlOptions = {}): Capability<void> {
	return {
		slot: LABELLED,
		surface: undefined,
		behavior(role): Behavior | undefined {
			if (role === 'control') {
				return {
					attrs: (bond) => {
						const label = bond.atomByRole('label')?.id;
						const description = bond.atomByRole('description')?.id;
						return {
							...(label ? { 'aria-labelledby': label } : {}),
							...(description ? { 'aria-describedby': description } : {})
						};
					}
				};
			}
			if (role === 'label' && options.nativeFor) {
				return { attrs: (bond) => ({ for: bond.atomByRole('control')?.id }) };
			}
			return undefined;
		}
	};
}
