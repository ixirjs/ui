export * as Stepper from './atoms';
export * from './step';
// Bond/state — part of the extension contract.
export * from './bond.svelte';
export * from './types';

// The same parts, named directly. `<Stepper.Root>` is a member expression, so the compiler treats it as a
// DYNAMIC component and wraps its output in a fragment boundary — measured at ~2.2 µs and ~1.5
// hydration anchors per part (card mount −20%, hydrate −27%, retained heap −21% on the direct call
// site; `bench:vs-shadcn`, 2026-08-27). The namespace stays the ergonomic default; reach for these
// where one part renders many times — a long list, a grid cell, a table row.
export { default as StepperRoot } from './stepper-root.svelte';
export { default as StepperHeader } from './stepper-header.svelte';
export { default as StepperBody } from './stepper-body.svelte';
export { default as StepperContent } from './stepper-content.svelte';
export { default as StepperFooter } from './stepper-footer.svelte';
