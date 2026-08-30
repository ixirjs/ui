import type { Snippet } from 'svelte';
import type { PlainPartProps } from '$ixirjs/ui/authoring';
import type { StateChangeCallback } from '$ixirjs/ui/types';
import type { PresetLike } from '$ixirjs/ui/preset';

// Extend to add custom switch properties in your application.
export interface SwitchExtendProps {}

export interface SwitchThumbSnippetProps {
	checked: boolean;
	props: Record<string, unknown>;
}

export interface SwitchPresets {
	/** Presentation layer for the internal thumb slot. */
	thumb?: PresetLike;
}

// The switch IS its `<button>` — see `PlainPartProps` for what that gives up (`as`, `base`, motion).
export interface SwitchProps extends PlainPartProps<'button'>, SwitchExtendProps {
	/** On state. Bindable for two-way control. */
	checked?: boolean;
	/** Disables the control: it stops responding and is removed from the tab order. */
	disabled?: boolean;
	// Forwarded to the hidden input.
	/** DOM id. Falls back to one derived from the Bond’s identity seed. */
	id?: string;
	// Forwarded to the hidden input.
	/** Form field name, submitted with the form. */
	name?: string;
	// Forwarded to the hidden input.
	/** Current value of the control. */
	value?: string;
	// Label content.
	/** Content of this part. */
	children?: Snippet<[]>;
	/** Replaces the internal thumb while preserving the resolved presentation props. */
	thumbContent?: Snippet<[SwitchThumbSnippetProps]>;
	/** Per-instance presentation overrides for compound slots. */
	presets?: SwitchPresets;
	/** Semantic callback; runs after `checked` commits. */
	oncheckedchange?: StateChangeCallback<boolean, never, MouseEvent>;
	// Native DOM callbacks retain their event-only signatures.
	/** Native click event. */
	onclick?: (event: MouseEvent) => void;
	/** Native input event, fired on every keystroke. */
	oninput?: (event: Event) => void;
	/** Native change event, fired when the value is committed. */
	onchange?: (event: Event) => void;
}
