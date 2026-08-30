export * as Toast from './atoms';
// Bond/state/spec — part of the extension contract.
export * from './bond.svelte';
export * from './types';
export { Toaster, type ToastType, type ToastOptions, type ToastItem } from './toaster.svelte';

// The same parts, named directly. `<Toast.Root>` is a member expression, so the compiler treats it as a
// DYNAMIC component and wraps its output in a fragment boundary — measured at ~2.2 µs and ~1.5
// hydration anchors per part (card mount −20%, hydrate −27%, retained heap −21% on the direct call
// site; `bench:vs-shadcn`, 2026-08-27). The namespace stays the ergonomic default; reach for these
// where one part renders many times — a long list, a grid cell, a table row.
export { default as ToastRoot } from './toast-root.svelte';
export { default as ToastTitle } from './toast-title.svelte';
export { default as ToastDescription } from './toast-description.svelte';
export { default as ToastClose } from './toast-close.svelte';
