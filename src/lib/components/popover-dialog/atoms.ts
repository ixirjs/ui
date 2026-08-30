// The fusion is one Bond shared under both halves' context keys, so the constituents' own parts
// resolve it: `<PopoverDialog.Trigger>` IS `<Popover.Trigger>` and `<PopoverDialog.Content>` IS
// `<Dialog.Content>`. Only Root (state + context) and Dialog (the modal surface it self-portals)
// are PopoverDialog's own.
export { default as Root } from './popover-dialog-root.svelte';
export { default as Dialog } from './popover-dialog-dialog.svelte';

// Popover's trigger (won the `trigger` slot in the fusion) — click toggles, ARIA = dialog.
export { Trigger, Tail } from '$ixirjs/ui/components/popover/atoms';

// Dialog's modal parts (won their slots), rendered inside Dialog's backdrop. They key their preset
// and their element id off `bond.name`, so under this Bond they resolve `popover-dialog.*`.
export { Content, Header, Body, Footer, CloseButton } from '$ixirjs/ui/components/dialog/atoms';
