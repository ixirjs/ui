import type { ResolvedProps } from './cache';
import { foldPresentation } from './fold';

// Thin wrapper over `foldPresentation` (ADR 0004 D5): returns the cascade-merged attrs axis
// (fallback → preset → mergedVariants → restProps). Kept as the stable public name.
export function extractRestProps(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	preset: Record<string, any> | undefined,
	mergedVariants: ResolvedProps | undefined,
	restProps: Record<string, unknown>,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	fallback?: Record<string, any> | undefined
): Record<string, unknown> {
	return foldPresentation(fallback, preset, mergedVariants, restProps).attrs as Record<
		string,
		unknown
	>;
}
