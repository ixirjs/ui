export * as Tooltip from './atoms';
export { TooltipBond, type TooltipBondProps } from './bond.svelte';
export type { TooltipSnippetProps, TooltipChildren, TooltipRootProps } from './types';

// The same parts, named directly. `<Tooltip.Root>` is a member expression, so the compiler treats it as a
// DYNAMIC component and wraps its output in a fragment boundary — measured at ~2.2 µs and ~1.5
// hydration anchors per part (card mount −20%, hydrate −27%, retained heap −21% on the direct call
// site; `bench:vs-shadcn`, 2026-08-27). The namespace stays the ergonomic default; reach for these
// where one part renders many times — a long list, a grid cell, a table row.
export { default as TooltipRoot } from './tooltip-root.svelte';
export { default as TooltipContent } from './tooltip-content.svelte';
export { default as TooltipTrigger } from './tooltip-trigger.svelte';
