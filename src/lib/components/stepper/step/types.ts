import type { Snippet } from 'svelte';
import type { HtmlAtomProps, Base, SnippetProps } from '$ixirjs/ui/components/atom';
import type { Factory } from '$ixirjs/ui/types';
import type { StepBond } from './bond.svelte';

// Snippet props
export interface StepSnippetProps extends SnippetProps {
	step: StepBond;
}

export type StepChildren = Snippet<[StepSnippetProps]>;

export interface StepRootProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, StepChildren> {
	// The step index (0-based).
	index: number;

	// Whether this step is disabled. Default false.
	disabled?: boolean;

	// Whether this step is completed. Default false.
	completed?: boolean;

	// Whether this step is optional. Default false.
	optional?: boolean;

	// Custom factory for creating the step bond.
	factory?: Factory<StepBond>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface StepIndicatorProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, StepChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface StepHeaderProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, StepChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface StepTitleProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, StepChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface StepDescriptionProps<
	E extends keyof HTMLElementTagNameMap = 'p',
	B extends Base = Base
> extends HtmlAtomProps<E, B, StepChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface StepBodyProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, StepChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface StepSeparatorProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, StepChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface StepContentProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, StepChildren> {}
