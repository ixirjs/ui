/**
 * The overlay core, on the redesigned Kernel: a base for modal/host families,
 * and shared policies written as ordinary functions. Popup-family defaults use the canonical
 * runtime in ./popup/; see its README. The capability bundles, the Atom
 * projections and `overlay-view` went with the old runtime on 2026-08-27.
 */
export * from './model.svelte';
export * from './behavior.svelte';
export * from './escape-stack.svelte';
