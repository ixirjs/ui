export * as AccordionItem from './atoms';
export * from './bond.svelte';
export * from './attachments.svelte';
export * from './motion.svelte';
export type * from './types';

// The same parts, named directly. `<AccordionItem.Root>` is a member expression, so the compiler treats it as a
// DYNAMIC component and wraps its output in a fragment boundary — measured at ~2.2 µs and ~1.5
// hydration anchors per part (card mount −20%, hydrate −27%, retained heap −21% on the direct call
// site; `bench:vs-shadcn`, 2026-08-27). The namespace stays the ergonomic default; reach for these
// where one part renders many times — a long list, a grid cell, a table row.
export { default as AccordionItemRoot } from './accordion-item-root.svelte';
export { default as AccordionItemHeader } from './accordion-item-header.svelte';
export { default as AccordionItemIndicator } from './accordion-item-indicator.svelte';
export { default as AccordionItemBody } from './accordion-item-body.svelte';
