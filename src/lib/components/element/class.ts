import { cn } from '$ixirjs/ui/utils';
import type { ClassValue } from 'svelte/elements';

// The default border colour the renderer applies to every element.
const BORDER_DEFAULT = 'border-border';

// Merged with `cn`, so a consumer border colour replaces the default instead of relying on CSS
// source order. The Kernel seam no longer calls this: it folds the border into its one memoised
// merge (`mergeClassesWithPreset(…, border = true)`), because running `twMerge` a second time on
// an already-merged class was 8% of a card's SSR self time. Kept for `HtmlElement`, which
// receives an arbitrary class value.
export function withDefaultBorder(klass: ClassValue | null | undefined): string {
	return cn(BORDER_DEFAULT, klass as never);
}
