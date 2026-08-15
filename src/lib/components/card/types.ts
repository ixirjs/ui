import type { Snippet } from 'svelte';
import type { CardBond } from './bond.svelte';
import type {
	RenderProps,
	Base,
	SnippetProps,
	HtmlElementTagName
} from '$ixirjs/ui/components/atom';
import type { Factory } from '$ixirjs/ui/types';

// Card Snippet Props
export interface CardSnippetProps extends SnippetProps {
	card: CardBond;
}

export type CardChildren = Snippet<[CardSnippetProps]>;

// Card Root Props
export interface CardRootProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, CardChildren> {
	/**
	 * Disable the card, preventing interaction when clickable
	 * @default false
	 */
	disabled?: boolean;
	/** Renders the card as an interactive surface — hover and focus affordances, and a `button` role when no other element supplies one. */
	clickable?: boolean;
	/** Custom factory for the card bond, enabling advanced behavioral customization */
	factory?: Factory<CardBond>;
	/** Click handler. When provided, the card becomes interactive/clickable with appropriate styling. */
	onclick?: (event: MouseEvent) => void;
	/** Keyboard event handler for accessible card interaction */
	onkeydown?: (event: KeyboardEvent) => void;
}

// Card Sub-component Props

export interface CardHeaderProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B> {}

export interface CardBodyProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B> {}

export interface CardFooterProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B> {}

export interface CardTitleProps<
	E extends HtmlElementTagName = 'h3',
	B extends Base = Base
> extends RenderProps<E, B> {}

export interface CardSubtitleProps<
	E extends HtmlElementTagName = 'p',
	B extends Base = Base
> extends RenderProps<E, B> {}

export interface CardDescriptionProps<
	E extends HtmlElementTagName = 'p',
	B extends Base = Base
> extends RenderProps<E, B> {}

export interface CardMediaProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B> {}

// Alias for CardBodyProps (used in card-body.svelte).
export type CardContentProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> = CardBodyProps<E, B>;
