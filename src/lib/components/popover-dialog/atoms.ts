// Reuses the constituents' own atom components — the fused bond is shared under their
// context keys (shared/authoring/fuse.svelte.ts), so `<Popover.Trigger>`/`<Dialog.*>` resolve it via
// PopoverBond.get()/DialogBond.get(). Only Root (bond + context) and Content (self-portals
// the modal backdrop) are PopoverDialog-specific.
export { default as Root } from './popover-dialog-root.svelte';
export { default as Content } from './popover-dialog-content.svelte';

// Popover's trigger (won the `trigger` slot in the fusion) — click toggles, ARIA = dialog.
export { Trigger } from '../popover/atoms';

// Dialog's modal parts (won their slots) — rendered inside Content's backdrop.
export { Header, Body, Footer, CloseButton } from '../dialog/atoms';
