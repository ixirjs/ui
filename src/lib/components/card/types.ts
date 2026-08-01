import type { Snippet } from 'svelte';
import type { CardBond } from './bond.svelte';
import type { HtmlAtomProps, Base, SnippetProps } from '$svelte-atoms/core/components/atom';
import type { Factory } from '$svelte-atoms/core/types';

// Card Snippet Props
export interface CardSnippetProps extends SnippetProps {
	card: CardBond;
}

export type CardChildren = Snippet<[CardSnippetProps]>;

// Card Root Props
export interface CardRootProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, CardChildren> {
	disabled?: boolean;
	factory?: Factory<CardBond>;
	onclick?: (event: MouseEvent) => void;
	onkeydown?: (event: KeyboardEvent) => void;
}

// Card Sub-component Props

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CardHeaderProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CardBodyProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CardFooterProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CardTitleProps<
	E extends keyof HTMLElementTagNameMap = 'h3',
	B extends Base = Base
> extends HtmlAtomProps<E, B> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CardSubtitleProps<
	E extends keyof HTMLElementTagNameMap = 'p',
	B extends Base = Base
> extends HtmlAtomProps<E, B> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CardDescriptionProps<
	E extends keyof HTMLElementTagNameMap = 'p',
	B extends Base = Base
> extends HtmlAtomProps<E, B> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CardMediaProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B> {}

// Alias for CardBodyProps (used in card-body.svelte).
export type CardContentProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> = CardBodyProps<E, B>;
