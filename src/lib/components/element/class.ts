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
	// The presentation kernel hands this an already-resolved string on every rendered element, and
	// `clsx` of a lone string returns that same string — so the common case skips the call entirely.
	const flat = typeof klass === 'string' ? klass : clsx(klass);
	if (!flat) return BORDER_DEFAULT;
	return hasBorderDefault(flat) ? flat : `${BORDER_DEFAULT} ${flat}`;
}

// Whole-token test — `border-border` must match standalone, never as a prefix of
// e.g. `border-border-foo`. The padded ` ${flat} ` form this replaces was correct but built one
// throwaway string per rendered element purely to turn a token test into a substring test.
function hasBorderDefault(flat: string): boolean {
	let index = flat.indexOf(BORDER_DEFAULT);
	while (index !== -1) {
		const end = index + BORDER_DEFAULT.length;
		if (
			(index === 0 || flat.charCodeAt(index - 1) === 32) &&
			(end === flat.length || flat.charCodeAt(end) === 32)
		) {
			return true;
		}
		index = flat.indexOf(BORDER_DEFAULT, index + 1);
	}
	return false;
}
