export * as Dialog from './atoms';
export * from './bond.svelte';
export * from './motion.svelte';
export * from './attachments.svelte';
export * from './types';

// The same parts, named directly. `<Dialog.Root>` is a member expression, so the compiler treats it as a
// DYNAMIC component and wraps its output in a fragment boundary — measured at ~2.2 µs and ~1.5
// hydration anchors per part (card mount −20%, hydrate −27%, retained heap −21% on the direct call
// site; `bench:vs-shadcn`, 2026-08-27). The namespace stays the ergonomic default; reach for these
// where one part renders many times — a long list, a grid cell, a table row.
export { default as DialogRoot } from './dialog-root.svelte';
export { default as DialogHeader } from './dialog-header.svelte';
export { default as DialogTitle } from './dialog-title.svelte';
export { default as DialogDescription } from './dialog-description.svelte';
export { default as DialogBody } from './dialog-body.svelte';
export { default as DialogFooter } from './dialog-footer.svelte';
export { default as DialogCloseButton } from './dialog-close.svelte';
export { default as DialogClose } from './dialog-close.svelte';
export { default as DialogContent } from './dialog-content.svelte';
