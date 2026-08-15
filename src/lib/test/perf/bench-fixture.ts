// Module entry for A/B benchmarking: exports the fixture so two builds (e.g. before/after a change)
// can be imported into one process and interleaved. Interleaving is what makes the comparison
// trustworthy on a machine with background load — both variants absorb the same drift.
export { default as Ablation } from './ablation.test.svelte';
export { default as DatagridAblation } from './datagrid-ablation.test.svelte';
export { default as TreeAblation } from './tree-ablation.test.svelte';
// The card layer as an application actually renders it, preset installed. A change to the shared
// presentation path moves this more than the bare ladder, so an A/B that omitted it was blind to
// the layer most like production.
export { default as PresetAblation } from './preset-ablation.test.svelte';
// The static Bond-less shape (Button/Badge), for A/B-ing the ~60 components that render an element
// with no Atom and no registration.
export { default as StaticAblation } from './static-ablation.test.svelte';
export type { AblationLayer } from './ablation.test.svelte';
