export * as Card from './atoms';

// Bond/state — part of the extension contract (extend/fuse).
export * from './bond.svelte';

export * from './types';

// The same parts, named directly. `<Card.Root>` is a member expression, so the compiler treats it as a
// DYNAMIC component and wraps its output in a fragment boundary — measured at ~2.2 µs and ~1.5
// hydration anchors per part (card mount −20%, hydrate −27%, retained heap −21% on the direct call
// site; `bench:vs-shadcn`, 2026-08-27). The namespace stays the ergonomic default; reach for these
// where one part renders many times — a long list, a grid cell, a table row.
export { default as CardRoot } from './card-root.svelte';
export { default as CardHeader } from './card-header.svelte';
export { default as CardTitle } from './card-title.svelte';
export { default as CardSubtitle } from './card-subtitle.svelte';
export { default as CardDescription } from './card-description.svelte';
export { default as CardBody } from './card-body.svelte';
export { default as CardMedia } from './card-media.svelte';
export { default as CardFooter } from './card-footer.svelte';
