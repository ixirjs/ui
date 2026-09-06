export { PopoverDialog } from '$ixirjs/ui/components/popover-dialog';
export type * from '$ixirjs/ui/components/popover-dialog/types';

// The parts by name, beside the namespace. `<PopoverDialog.Root>` is a member expression — a DYNAMIC
// component with a fragment boundary per part: a table row of four parts measured mount −37%,
// hydrate −28% and 5 hydration anchors fewer on the direct call site (`bench:vs-shadcn`,
// 2026-08-27). Use these where one part renders many times.
export { PopoverDialogRoot, PopoverDialogDialog } from '$ixirjs/ui/components/popover-dialog';

export type { PopoverDialogBond } from '$ixirjs/ui/components/overlay/popup/types';
