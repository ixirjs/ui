import type { ResolvedProps } from './cache';
import { foldPresentation } from './fold';
import { mergeSpreadProps } from '../../../shared/bond/merge';

// Thin wrapper over `foldPresentation`: returns the cascade-merged attrs axis
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

// Single source of truth for the bonded part merge repeated across components. The atom's own spread
// is the base, component rest props are the explicit user layer, and events/attachments compose via
// the deterministic bond merge rules. The resolved preset is the component override falling back to
// the atom's default preset key.
export function mergeAtomProps(
	atom: { preset?: string; spread?: Record<string | symbol, unknown> } | undefined,
	preset: unknown,
	restProps: Record<string, unknown>
): Record<string, unknown> {
	return {
		preset: preset ?? atom?.preset,
		...mergeSpreadProps(atom?.spread, restProps, {
			source: atom?.preset ? `atom preset "${atom.preset}"` : 'atom spread',
			nextSource: 'component props',
			nextIsUser: true
		})
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
