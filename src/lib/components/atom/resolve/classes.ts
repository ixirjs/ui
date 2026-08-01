import clsx from 'clsx';
import { cn, type ClassValue } from '$ixirjs/ui/utils';

const PLACEHOLDER = '$preset';

function withoutPreset(value: string): string {
	return value.split(PLACEHOLDER).join('');
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
				withoutPreset(userClass.slice(index + PLACEHOLDER.length))
			);
		}
	}

	if (Array.isArray(userClass)) {
		return mergeClassesWithPreset(clsx(userClass as never[]), presetClass, variantClass);
	}

	return cn(presetClass, variantClass, userClass);
}
