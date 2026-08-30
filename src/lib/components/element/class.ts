import { cn } from '$ixirjs/ui/utils';
import type { ClassValue } from 'svelte/elements';

// The default border colour the renderer applies to every element.
const BORDER_DEFAULT = 'border-border';

// Merged with `cn`, so a consumer border colour replaces the default instead of relying on CSS
// source order, and the hand-rolled whole-token dedup is gone — `tailwind-merge` collapses the
// duplicate itself. This re-runs `twMerge` on a class the kernel already merged
// (`mergeClassesWithPreset`), which the previous clsx-only version existed to avoid; the cost is
// one merge per rendered element (docs/performance/presentation-kernel-perf.md).
export function withDefaultBorder(klass: ClassValue | null | undefined): string {
	return cn(BORDER_DEFAULT, klass as never);
}
