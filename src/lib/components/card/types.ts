import type { Snippet } from 'svelte';
import type { CardBond } from './bond.svelte';
import type { PlainPartProps, SnippetProps } from '$ixirjs/ui/authoring';
import type { Factory } from '$ixirjs/ui/types';

// Card Snippet Props
export interface CardSnippetProps extends SnippetProps {
	card: CardBond;
}

export type CardChildren = Snippet<[CardSnippetProps]>;

// Card Root Props
// The root IS its `<div>` — see `PlainPartProps` for what that gives up (`as`, `base`, motion).
export interface CardRootProps extends PlainPartProps<'div', CardChildren> {
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
//
// Every part below IS its element — a literal `<div>`/`<h3>`/`<p>` spreading the node's attributes —
// so none takes `as`, `base` or motion. `PlainPartProps` types those `never`; the dispatch they used
// to buy was a block, a branch and a hydration anchor per part. See `PlainPartProps`.

export interface CardHeaderProps extends PlainPartProps<'div'> {}

export interface CardBodyProps extends PlainPartProps<'div'> {}

export interface CardFooterProps extends PlainPartProps<'div'> {}

export interface CardTitleProps extends PlainPartProps<'h3'> {}

export interface CardSubtitleProps extends PlainPartProps<'p'> {}

export interface CardDescriptionProps extends PlainPartProps<'p'> {}

export interface CardMediaProps extends PlainPartProps<'div'> {}

// Alias for CardBodyProps (used in card-body.svelte).
export type CardContentProps = CardBodyProps;
