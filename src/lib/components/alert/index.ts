export * as Alert from './atoms';
export type { AlertBondProps, AlertBond } from './bond.svelte';
export * from './types';

// The same parts, named directly. `<Alert.Root>` is a member expression, so the compiler treats it as a
// DYNAMIC component and wraps its output in a fragment boundary — measured at ~2.2 µs and ~1.5
// hydration anchors per part (card mount −20%, hydrate −27%, retained heap −21% on the direct call
// site; `bench:vs-shadcn`, 2026-08-27). The namespace stays the ergonomic default; reach for these
// where one part renders many times — a long list, a grid cell, a table row.
export { default as AlertRoot } from './alert-root.svelte';
export { default as AlertIcon } from './alert-icon.svelte';
export { default as AlertTitle } from './alert-title.svelte';
export { default as AlertDescription } from './alert-description.svelte';
export { default as AlertContent } from './alert-content.svelte';
export { default as AlertActions } from './alert-actions.svelte';
export { default as AlertCloseButton } from './alert-close.svelte';
