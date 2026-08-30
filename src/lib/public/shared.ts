// Stable authoring interface: the element seam, the identity helpers and the behaviour models a
// family composes. The Bond/Atom runtime (`defineBond`, `useRoot`, `definePart`,
// `createAtomInstance`) was removed on 2026-08-27 — every part authors through `Kernel.element`
// now, and a family's shared object is a plain state class under `Kernel.context`. ADR 0008.
export { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
export type { KernelElement, ElementSpec } from '$ixirjs/ui/kernel/kernel.svelte';

// ─── Behaviour models ─────────────────────────────────────────────────────────
// A `create*` backing-to-model factory plus its types. The `*Capability` projections and slot keys
// went with the Bond/Atom runtime on 2026-08-27: a family calls the factory as an ordinary function
// and writes the ARIA and `data-*` projections literally in each part's `attrs`.
export { createDisclosure } from '$ixirjs/ui/capability/models/disclosure.svelte';
export type { Disclosure, DisclosureBacking } from '$ixirjs/ui/capability/models/disclosure.svelte';
export { createSelection } from '$ixirjs/ui/capability/models/selection.svelte';
export type {
	SelectionBacking,
	SelectionModel
} from '$ixirjs/ui/capability/models/selection.svelte';
export { createInput } from '$ixirjs/ui/capability/models/input.svelte';
export type { InputField, InputModel } from '$ixirjs/ui/capability/models/input.svelte';
export { createRovingFocus } from '$ixirjs/ui/capability/models/roving.svelte';
export type { RovingBacking, RovingFocus } from '$ixirjs/ui/capability/models/roving.svelte';

// Motion primitives used by families that animate their own parts.
export { animate } from '$ixirjs/ui/utils/animate';
export type { Easing } from '$ixirjs/ui/utils/animate';
export { DURATION } from '$ixirjs/ui/constants/motion';

export { createSort } from '$ixirjs/ui/capability/models/sort.svelte';
export { createPagination } from '$ixirjs/ui/capability/models/pagination.svelte';
export { createGeometry } from '$ixirjs/ui/capability/models/geometry.svelte';
export { createStatus } from '$ixirjs/ui/capability/models/status.svelte';
export { createValidation } from '$ixirjs/ui/capability/models/validation.svelte';
export { createTypeahead } from '$ixirjs/ui/capability/models/typeahead.svelte';
