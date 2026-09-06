import type { ComputePositionReturn, Placement } from '@floating-ui/dom';
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import type { OverlayProps } from '$ixirjs/ui/components/overlay/model.svelte';
import type { PortalBond } from '$ixirjs/ui/components/portal';
import type { PopoverStrategy } from './strategy-types';
import type { PopoverPresets } from './types';
import type { PopoverBond } from '$ixirjs/ui/components/overlay/popup/types';
export type {
	PopoverBond,
	PositionedPopup as PopoverBondBase
} from '$ixirjs/ui/components/overlay/popup/types';

export type PopoverParams = {
	apply?: (
		node: HTMLElement,
		params: { x: number; y: number; dx: number; dy: number; open: boolean; offset: number }
	) => void;

	onpositionchange?: (node: HTMLElement, params: ComputePositionReturn) => void;
};

export type PopoverBondProps = OverlayProps & {
	placements: Placement[];
	placement: Placement | undefined;
	offset: number;
	// CSS positioning strategy for the floating content. Set explicitly by the consumer;
	// always authoritative (a host overlay no longer forces it). Defaults to 'absolute'.
	position: 'fixed' | 'absolute';
	portal?: string | PortalBond | undefined;
	strategy?: PopoverStrategy | undefined;
	presets?: PopoverPresets | undefined;
};

export type PopoverStateProps = PopoverBondProps;

export type TriggerParams = {
	onclick?: (ev: MouseEvent) => void;
};

export const PopoverContext = Kernel.context<PopoverBond>('bond/popover');
