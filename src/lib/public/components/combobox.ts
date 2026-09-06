export { Combobox } from '$ixirjs/ui/components/combobox';
export type * from '$ixirjs/ui/components/combobox/types';

// The parts by name, beside the namespace. `<Combobox.Root>` is a member expression — a DYNAMIC
// component with a fragment boundary per part: a table row of four parts measured mount −37%,
// hydrate −28% and 5 hydration anchors fewer on the direct call site (`bench:vs-shadcn`,
// 2026-08-27). Use these where one part renders many times.
export {
	ComboboxRoot,
	ComboboxTrigger,
	ComboboxItem,
	ComboboxControl,
	ComboboxSelections
} from '$ixirjs/ui/components/combobox';

export type { ComboboxBond } from '$ixirjs/ui/components/overlay/popup/types';
