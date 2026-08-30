export * as Scrollable from './atoms';
export type * from './scrollable-root.svelte';
export type * from './scrollable-content.svelte';
export type * from './scrollable-track.svelte';
export type * from './scrollable-thumb.svelte';

export {
	ScrollableBond,
	type ScrollableBondElements,
	type ScrollableBondProps
} from './bond.svelte';
export { scrollable } from './attachments.svelte';

export * from './types';

// The same parts, named directly. `<Scrollable.Root>` is a member expression, so the compiler treats it as a
// DYNAMIC component and wraps its output in a fragment boundary — measured at ~2.2 µs and ~1.5
// hydration anchors per part (card mount −20%, hydrate −27%, retained heap −21% on the direct call
// site; `bench:vs-shadcn`, 2026-08-27). The namespace stays the ergonomic default; reach for these
// where one part renders many times — a long list, a grid cell, a table row.
export { default as ScrollableRoot } from './scrollable-root.svelte';
export { default as ScrollableContainer } from './scrollable-container.svelte';
export { default as ScrollableContent } from './scrollable-content.svelte';
export { default as ScrollableTrack } from './scrollable-track.svelte';
export { default as ScrollableThumb } from './scrollable-thumb.svelte';
