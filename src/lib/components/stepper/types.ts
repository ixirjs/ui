import type { Snippet } from 'svelte';
import type { HtmlAtomProps, Base, SnippetProps } from '$ixirjs/ui/components/atom';
import type { Factory, StateChangeCallback } from '$ixirjs/ui/types';
import type { StepperBond } from './bond.svelte';

// Snippet props
export interface StepperSnippetProps extends SnippetProps {
	stepper: StepperBond;
}

export type StepperChildren = Snippet<[StepperSnippetProps]>;

export interface StepperRootProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, StepperChildren> {
	// Active step index (0-based, bindable).
	step?: number;

	// Whether to enforce linear progression (only next/previous allowed). Default false.
	linear?: boolean;

	// Whether the stepper is disabled. Default false.
	disabled?: boolean;

	// Layout orientation. Default 'horizontal'.
	orientation?: 'horizontal' | 'vertical';

	// Custom factory for creating the stepper bond.
	factory?: Factory<StepperBond>;

	// Semantic callback; runs after the active step commits.
	onstepchange?: StateChangeCallback<number, StepperBond> | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface StepperHeaderProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, StepperChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface StepperBodyProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, StepperChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface StepperFooterProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, StepperChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface StepperContentProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, StepperChildren> {}
