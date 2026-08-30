export * from './types';
export * as Tree from './atoms';
// Bond/state — part of the extend/fuse contract.
export * from './bond.svelte';
export * from './motion.svelte';

// The same parts, named directly. `<Tree.Root>` is a member expression, so the compiler treats it as a
// DYNAMIC component and wraps its output in a fragment boundary — measured at ~2.2 µs and ~1.5
// hydration anchors per part (card mount −20%, hydrate −27%, retained heap −21% on the direct call
// site; `bench:vs-shadcn`, 2026-08-27). The namespace stays the ergonomic default; reach for these
// where one part renders many times — a long list, a grid cell, a table row.
export { default as TreeRoot } from './tree-root.svelte';
export { default as TreeHeader } from './tree-header.svelte';
export { default as TreeBody } from './tree-body.svelte';
export { default as TreeIndicator } from './tree-indicator.svelte';
