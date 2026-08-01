// Module entry for A/B benchmarking: exports the fixture so two builds (e.g. before/after a change)
// can be imported into one process and interleaved. Interleaving is what makes the comparison
// trustworthy on a machine with background load — both variants absorb the same drift.
export { default as Ablation } from './ablation.test.svelte';
export { default as DatagridAblation } from './datagrid-ablation.test.svelte';
export { default as TreeAblation } from './tree-ablation.test.svelte';
export type { AblationLayer } from './ablation.test.svelte';
