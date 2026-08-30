import type { Snippet } from 'svelte';
import type { RenderProps, Base, SnippetProps, HtmlElementTagName } from '$ixirjs/ui/authoring';
import type { Factory, StateChangeCallback } from '$ixirjs/ui/types';
import type { StepperBond } from './bond.svelte';

// Snippet props
export interface StepperSnippetProps extends SnippetProps {
	stepper: StepperBond;
}

export type StepperChildren = Snippet<[StepperSnippetProps]>;

export interface StepperRootProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, StepperChildren> {
	// Active step index (0-based, bindable).
	/**
	 * Active step index (0-based). Bindable for two-way sync.
	 * @default 0
	 */
	step?: number;

	// Whether to enforce linear progression (only next/previous allowed). Default false.
	/**
	 * Enforce linear progression - users can only navigate to adjacent steps
	 * @default false
	 */
	linear?: boolean;

	// Whether the stepper is disabled. Default false.
	/**
	 * Disable the entire stepper
	 * @default false
	 */
	disabled?: boolean;

	// Layout orientation. Default 'horizontal'.
	/** Layout orientation for the stepper */
	orientation?: 'horizontal' | 'vertical';

	// Custom factory for creating the stepper bond.
	/** Custom factory for creating stepper bond */
	factory?: Factory<StepperBond>;

	/** Semantic callback; runs after the active step commits. */
	onstepchange?: StateChangeCallback<number, StepperBond> | undefined;
}

export interface StepperHeaderProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, StepperChildren> {}

export interface StepperBodyProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, StepperChildren> {}

export interface StepperFooterProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, StepperChildren> {}

export interface StepperContentProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, StepperChildren> {}
