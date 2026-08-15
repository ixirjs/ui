import type { RenderProps } from '$ixirjs/ui/components/atom';

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

export interface ProgressLinearProps extends RenderProps<'div'>, ProgressSharedProps {}

export interface ProgressCircularProps extends RenderProps<'div'>, ProgressSharedProps {}
