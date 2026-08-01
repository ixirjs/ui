export { Root as Accordion } from './atoms';
// Extension contract: consumers subclass these and inject a custom bond via the root's `factory` prop. See CONTEXT.md §"Child→parent seam".
export * from './bond.svelte';
export * from './item';
export * from './types';
