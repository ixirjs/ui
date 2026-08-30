import type { PlainPartProps } from '$ixirjs/ui/authoring';

interface ProgressSharedProps {
	/**
	 * Current progress value (0–max). Set to `null` for indeterminate state.
	 * @default null
	 */
	value?: number | null;
	/**
	 * Maximum value used to compute the percentage.
	 * @default 100
	 */
	max?: number;
}

// Both roots ARE their `<div>` — no `as`/`base`/motion; see `PlainPartProps`.
export interface ProgressLinearProps extends PlainPartProps<'div'>, ProgressSharedProps {}

export interface ProgressCircularProps extends PlainPartProps<'div'>, ProgressSharedProps {}
