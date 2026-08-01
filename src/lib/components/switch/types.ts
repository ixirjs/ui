import type { Snippet } from 'svelte';
import type { HtmlAtomProps } from '$svelte-atoms/core/components/atom';

// Extend to add custom switch properties in your application.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SwitchExtendProps {}

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
	onclick?: (ev?: MouseEvent) => void;
	onchange?: (ev?: Event, options?: { checked: boolean }) => void;
}
