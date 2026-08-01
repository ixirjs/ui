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
	return hasToken(flat, BORDER_DEFAULT) ? flat : `${BORDER_DEFAULT} ${flat}`;
}

// Whole-token membership test — `border-border` must match as a standalone class, never as a
// prefix of e.g. `border-border-foo`.
function hasToken(cls: string, token: string): boolean {
	let i = cls.indexOf(token);
	while (i !== -1) {
		const atStart = i === 0 || cls[i - 1] === ' ';
		const end = i + token.length;
		const atEnd = end === cls.length || cls[end] === ' ';
		if (atStart && atEnd) return true;
		i = cls.indexOf(token, end);
	}
	return false;
}
