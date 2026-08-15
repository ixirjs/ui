import type { Snippet } from 'svelte';
import type {
	RenderProps,
	Base,
	SnippetProps,
	HtmlElementTagName
} from '$ixirjs/ui/components/atom';
import type { Factory } from '$ixirjs/ui/types';
import type { StepBond } from './bond.svelte';

// Snippet props
export interface StepSnippetProps extends SnippetProps {
	step: StepBond;
}

export type StepChildren = Snippet<[StepSnippetProps]>;

export interface StepRootProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, StepChildren> {
	// The step index (0-based).
	/**
	 * Step index (0-based) in the stepper sequence
	 * @default required
	 */
	index: number;

	// Whether this step is disabled. Default false.
	/**
	 * Whether this step is disabled
	 * @default false
	 */
	disabled?: boolean;

	// Whether this step is completed. Default false.
	/**
	 * Whether this step is completed
	 * @default false
	 */
	completed?: boolean;

	// Whether this step is optional. Default false.
	/**
	 * Whether this step is optional
	 * @default false
	 */
	optional?: boolean;

	// Custom factory for creating the step bond.
	/** Custom factory for creating step bond */
	factory?: Factory<StepBond>;
}

export interface StepIndicatorProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, StepChildren> {}

export interface StepHeaderProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, StepChildren> {}

export interface StepTitleProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, StepChildren> {}

export interface StepDescriptionProps<
	E extends HtmlElementTagName = 'p',
	B extends Base = Base
> extends RenderProps<E, B, StepChildren> {}

export interface StepBodyProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, StepChildren> {}

export interface StepSeparatorProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, StepChildren> {}

export interface StepContentProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, StepChildren> {}
