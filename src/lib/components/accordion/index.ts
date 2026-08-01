export { Root as Accordion } from './atoms';
// Extension contract: bond, state, root atom, and the narrow child-facing
// interface — exported so consumers can subclass them and inject a custom bond
// via the root's `factory` prop. See CONTEXT.md §"Child→parent seam".
export * from './bond.svelte';
export * from './item';
export * from './types';
