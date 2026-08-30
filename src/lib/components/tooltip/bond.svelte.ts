import { PopoverBondBase, type PopoverBondProps } from '$ixirjs/ui/components/popover/bond.svelte';
import type { OverlayBond, OverlayLike } from '$ixirjs/ui/components/overlay/model.svelte';

export type TooltipBondProps = PopoverBondProps;

// TooltipBond — Popover re-branded as `tooltip`.
//
// The shared Popover parts read the family name off the bond, so every part's preset key resolves
// as `tooltip.<slot>` (`tooltip.content`, `tooltip.trigger`) instead of `popover.<slot>`, and the
// Tooltip root shares it under Popover's context so `<Popover.*>` parts still find it.
export class TooltipBond extends PopoverBondBase<TooltipBondProps> {
	constructor(props: TooltipBondProps) {
		super(props, 'tooltip');
	}

	// The second overload only keeps the static side compatible with `OverlayBond.create(outer?)`.
	static override create(props: TooltipBondProps): TooltipBond;
	static override create(outer?: OverlayLike): OverlayBond;
	static override create(props?: TooltipBondProps | OverlayLike): OverlayBond {
		return new TooltipBond(props as TooltipBondProps);
	}
}
