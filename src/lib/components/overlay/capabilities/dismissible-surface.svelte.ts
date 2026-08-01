import {
	defineFocusedCapability,
	sharedCapabilityKey,
	type Capability,
	type CapabilityMetadata
} from '$ixirjs/ui/shared/bond';
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

export type DismissibleSurfaceCapabilityBundle = readonly Capability[] & {
	readonly meta: CapabilityMetadata;
};

const DISMISSIBLE_SURFACE = sharedCapabilityKey<readonly Capability[]>({
	owner: '@ixirjs/cap',
	name: 'focused:dismissible-surface',
	version: 1
});

export interface DismissibleSurfaceCapabilityOptions {
	escape?: Capability<EscapeHandler> | false;
	outsidePress?: OutsidePressOptions | false;
	backdropPress?: DismissHandlerOptions | false;
}

export function dismissPolicy(
	options: DismissibleSurfaceCapabilityOptions = {}
): DismissibleSurfaceCapabilityBundle {
	const capabilities: Capability[] = [];
	if (options.escape !== false) capabilities.push(options.escape ?? closeOnEscape);
	if (options.outsidePress !== false) capabilities.push(outsidePressPolicy(options.outsidePress));
	if (options.backdropPress !== false)
		capabilities.push(backdropPressPolicy(options.backdropPress));

	const marker = defineFocusedCapability({
		slot: DISMISSIBLE_SURFACE,
		capabilities,
		meta: {
			projects: ['surface', 'backdrop'],
			docs: 'Layer 2 bundle for Escape, outside-press, and backdrop-press dismissal.'
		}
	});

	return Object.assign([marker, ...capabilities], {
		meta: marker.meta
	}) as DismissibleSurfaceCapabilityBundle;
}
