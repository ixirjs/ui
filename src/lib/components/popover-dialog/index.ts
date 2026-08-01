// PopoverDialog — the first Fusion: fuse(Popover, Dialog). Popover's trigger
// opens Dialog's modal content. Namespace `PopoverDialog`; the fused bond is
// `PopoverDialogBond` (consistent with DialogBond/DrawerBond).
export * as PopoverDialog from './atoms';
export { PopoverDialogBond, type PopoverDialogBondProps } from './bond.svelte';
export * from './types';
