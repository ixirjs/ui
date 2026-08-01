import { type Capability } from '$ixirjs/ui/shared/bond';
import {
	closeOnEscape,
	type EscapeHandler
} from '$ixirjs/ui/components/overlay/policies/escape.svelte';
import {
	backdropPressPolicy,
	outsidePressPolicy,
	type DismissHandlerOptions,
	type OutsidePressOptions
} from '$ixirjs/ui/components/overlay/policies/dismiss.svelte';

export interface DismissibleSurfaceCapabilityOptions {
	escape?: Capability<EscapeHandler> | false;
	outsidePress?: OutsidePressOptions | false;
	backdropPress?: DismissHandlerOptions | false;
}

/**
 * Escape, outside-press, and backdrop-press dismissal, as a plain list to spread into a Bond.
 *
 * This used to also register a marker capability holding a frozen copy of the list. Nothing read
 * that copy — the registry is the source of truth — so it cost one slot and one descriptor per
 * overlay to describe what spreading the array already says.
 */
export function dismissPolicy(
	options: DismissibleSurfaceCapabilityOptions = {}
): readonly Capability[] {
	const capabilities: Capability[] = [];
	if (options.escape !== false) capabilities.push(options.escape ?? closeOnEscape);
	if (options.outsidePress !== false) capabilities.push(outsidePressPolicy(options.outsidePress));
	if (options.backdropPress !== false)
		capabilities.push(backdropPressPolicy(options.backdropPress));
	return capabilities;
}
