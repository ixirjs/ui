// SSR entry for the CLIENT benchmark's hydrate leg. The driver imports this in node to produce the
// server markup the browser then hydrates, so both halves hydrate exactly what the server emits —
// hand-written or client-rendered HTML would skip the anchors that hydration actually walks.
export { default as Nesting } from './nesting-ablation.test.svelte';
