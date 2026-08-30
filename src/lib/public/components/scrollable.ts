export { Scrollable } from '$ixirjs/ui/components/scrollable';
export type * from '$ixirjs/ui/components/scrollable/types';

// The parts by name, beside the namespace. `<Scrollable.Root>` is a member expression — a DYNAMIC
// component with a fragment boundary per part: a table row of four parts measured mount −37%,
// hydrate −28% and 5 hydration anchors fewer on the direct call site (`bench:vs-shadcn`,
// 2026-08-27). Use these where one part renders many times.
export {
	ScrollableRoot,
	ScrollableContainer,
	ScrollableContent,
	ScrollableTrack,
	ScrollableThumb
} from '$ixirjs/ui/components/scrollable';
