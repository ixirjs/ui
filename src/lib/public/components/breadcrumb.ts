export { Breadcrumb } from '$ixirjs/ui/components/breadcrumb';
export type * from '$ixirjs/ui/components/breadcrumb/types';

// The parts by name, beside the namespace. `<Breadcrumb.Root>` is a member expression — a DYNAMIC
// component with a fragment boundary per part: a table row of four parts measured mount −37%,
// hydrate −28% and 5 hydration anchors fewer on the direct call site (`bench:vs-shadcn`,
// 2026-08-27). Use these where one part renders many times.
export {
	BreadcrumbSeparator,
	BreadcrumbItem,
	BreadcrumbRoot
} from '$ixirjs/ui/components/breadcrumb';
