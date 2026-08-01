// Constrain `value` to the inclusive range [min, max]. Single source of truth for the
// repeated `Math.min(max, Math.max(min, value))` pattern across inputs, segments and sliders.
export function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}
