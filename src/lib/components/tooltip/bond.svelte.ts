import {
	PopoverBond,
	PopoverBondBase,
	type PopoverBondProps
} from '$ixirjs/ui/components/popover/bond.svelte';
import { defineBond, type BondOf } from '$ixirjs/ui/shared';

export type TooltipBondProps = PopoverBondProps;

// TooltipBond — Popover re-branded as `tooltip`.
//
// `parts: [PopoverBond]` carries over popover's full atom set (trigger, overlay,
// content, tail, indicator, virtual-trigger) and its positioned + focus capabilities,
// and threads popover's context keys so `<Popover.*>` atom components still resolve via
// `PopoverBond.get()` / `OverlayBond.get()` when they sit under a Tooltip.Root.
//
// `base: PopoverBondBase` inherits popover's runtime behaviour (floating position tracking).
//
// The only thing that changes is `namespace` → `'tooltip'`, so every atom's preset key
// resolves as `tooltip.<slot>` (e.g. `tooltip.content`, `tooltip.trigger`) instead of
// `popover.<slot>`. Atoms read the namespace off the bond at runtime, so no atom subclasses
// are needed — the shared popover atoms pick up the tooltip preset namespace automatically.
// Inlined deliberately: `defineBond<const S>` infers `parts` as a tuple only from a literal
// argument. A hoisted spec widens it to an array, which makes `AtomsOf` resolve every inherited
// slot to `never` and blocks `Kernel.part` on slots the runtime spec merge does provide.
export const TooltipBond = defineBond({
	parts: [PopoverBond],
	name: 'tooltip',
	base: PopoverBondBase,
	atoms: {}
});

export type TooltipBond = BondOf<typeof TooltipBond>;
