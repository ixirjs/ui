/**
 * The overlay core, on the redesigned Kernel: one plain state class every overlay family extends,
 * and the policies it composes written as ordinary functions. The capability bundles, the Atom
 * projections and `overlay-view` went with the old runtime on 2026-08-27.
 */
export * from './model.svelte';
export * from './behavior.svelte';
export * from './escape-stack.svelte';
