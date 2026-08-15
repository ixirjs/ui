import clsx from 'clsx';
import { cn, type ClassValue } from '$ixirjs/ui/utils';

const PLACEHOLDER = '$preset';

/**
 * Strip any remaining sentinel. `split().join()` allocates an array and a string even when there is
 * nothing to strip, and on the shared class path that ran twice per rendered part — it and its
 * caller were together ~5.5% of SSR self time on a card page. Nearly every part carries exactly one
 * `$preset`, so the guard hits almost always.
 */
function withoutPreset(value: string): string {
	return value.includes(PLACEHOLDER) ? value.split(PLACEHOLDER).join('') : value;
}

// Merges preset + variant + consumer classes. The last `$preset` controls placement;
// earlier placeholders are removed.
export function mergeClassesWithPreset(
	userClass: string | ClassValue | undefined,
	presetClass: ClassValue | undefined,
	variantClass: ClassValue | undefined
): string {
	if (typeof userClass === 'string') {
		const index = userClass.lastIndexOf(PLACEHOLDER);
		if (index !== -1) {
			return cn(
				withoutPreset(userClass.slice(0, index)),
				presetClass,
				variantClass,
				// The tail is taken from AFTER the last occurrence, so it provably holds no sentinel —
				// stripping it was a guaranteed no-op walk on every rendered part.
				userClass.slice(index + PLACEHOLDER.length)
			);
		}
	}

	if (Array.isArray(userClass)) {
		return mergeClassesWithPreset(clsx(userClass as never[]), presetClass, variantClass);
	}

	return cn(presetClass, variantClass, userClass);
}
