import clsx from 'clsx';
import type { ClassValue } from 'svelte/elements';

// The default border colour the renderer applies to every element.
const BORDER_DEFAULT = 'border-border';

// `klass` reaches the renderer already `tailwind-merge`d by the presentation kernel
// (`mergeClassesWithPreset`), so re-running `twMerge` here is redundant work on the hot render
// path (documented in docs/performance/presentation-kernel-perf.md). We still flatten with `clsx`
// (array/object class values, no merge cost) but skip the second `twMerge`, prepending the default
// border colour once — and only when the consumer has not already supplied `border-border`.
// The default is prepended, so any consumer border utility appears after it and wins by CSS
// source order, matching what the second `twMerge` used to resolve, without the merge pass.
export function withDefaultBorder(klass: ClassValue | null | undefined): string {
	const flat = clsx(klass);
	if (!flat) return BORDER_DEFAULT;
	// Whole-token test — `border-border` must match standalone, never as a prefix of
	// e.g. `border-border-foo`. Padding both sides makes ' token ' the only match.
	return ` ${flat} `.includes(` ${BORDER_DEFAULT} `) ? flat : `${BORDER_DEFAULT} ${flat}`;
}
