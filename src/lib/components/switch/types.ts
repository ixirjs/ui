import type { Snippet } from 'svelte';
import type { HtmlAtomProps } from '$ixirjs/ui/components/atom';
import type { StateChangeCallback } from '$ixirjs/ui/types';
import type { PresetLike } from '$ixirjs/ui/preset';

// Extend to add custom switch properties in your application.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SwitchExtendProps {}

export interface SwitchThumbSnippetProps {
	checked: boolean;
	props: Record<string, unknown>;
}

export interface SwitchPresets {
	/** Presentation layer for the internal thumb slot. */
	thumb?: PresetLike;
}

export interface SwitchProps extends HtmlAtomProps<'button'>, SwitchExtendProps {
	// On state.
	checked?: boolean;
	disabled?: boolean;
	// Forwarded to the hidden input.
	id?: string;
	// Forwarded to the hidden input.
	name?: string;
	// Forwarded to the hidden input.
	value?: string;
	// Label content.
	children?: Snippet<[]>;
	// Replace the internal thumb while preserving the resolved presentation props.
	thumbContent?: Snippet<[SwitchThumbSnippetProps]>;
	/** Per-instance presentation overrides for compound slots. */
	presets?: SwitchPresets;
	// Semantic state callback; runs after `checked` commits.
	oncheckedchange?: StateChangeCallback<boolean, never, MouseEvent>;
	// Native DOM callbacks retain their event-only signatures.
	onclick?: (event: MouseEvent) => void;
	oninput?: (event: Event) => void;
	onchange?: (event: Event) => void;
}
