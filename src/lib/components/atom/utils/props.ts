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

// Single source of truth for the `{ preset: preset ?? atom?.preset, ...atom?.spread, ...restProps }`
// derivation repeated across every bonded part component. Layering (last wins): the atom's own spread
// (attrs/handlers/attachments) is the base, the component's rest props override, and the resolved
// preset is the component override falling back to the atom's default preset key.
export function mergeAtomProps(
	atom: { preset?: string; spread?: Record<string | symbol, unknown> } | undefined,
	preset: unknown,
	restProps: Record<string, unknown>
): Record<string, unknown> {
	return {
		preset: preset ?? atom?.preset,
		...atom?.spread,
		...restProps
	};
}

// Static-preset sibling of `mergeAtomProps` for presentational components with no bond atom:
// the preset falls back to a literal key instead of `atom.preset`, and there is no atom spread.
// Single source of truth for the `{ preset: preset ?? '<key>', ...restProps }` derivation repeated
// across the non-bonded parts (card/alert/calendar/button/badge/…).
export function mergePresetProps(
	preset: unknown,
	fallback: string,
	restProps: Record<string, unknown>
): Record<string, unknown> {
	return {
		preset: preset ?? fallback,
		...restProps
	};
}
