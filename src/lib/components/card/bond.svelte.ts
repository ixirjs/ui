import { createAttachmentKey } from 'svelte/attachments';
import { getElementId } from '$svelte-atoms/core/utils/dom.svelte';
import { bondContextKey, Bond, type BondStateProps } from '$svelte-atoms/core/shared/bond';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type CardBondProps = BondStateProps & {
	disabled?: boolean;
	clickable?: boolean;
};

export type CardBondElements = {
	root: HTMLElement;
	header: HTMLElement;
	title: HTMLElement;
	subtitle: HTMLElement;
	description: HTMLElement;
	content: HTMLElement;
	media: HTMLElement;
	actions: HTMLElement;
	footer: HTMLElement;
};

const CARD_ELEMENTS_KIND = {
	root: 'card-root',
	header: 'card-header',
	title: 'card-title',
	subtitle: 'card-subtitle',
	description: 'card-description',
	content: 'card-content',
	media: 'card-media',
	actions: 'card-actions',
	footer: 'card-footer'
};

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

export class CardBond extends Bond<CardBondProps> {
	static CONTEXT_KEY = bondContextKey('card');

	constructor(props: CardBondProps) {
		super(props);
	}

	root(props: Record<string, unknown> = {}) {
		const id = getElementId(this.id, CARD_ELEMENTS_KIND.root);
		const titleId = getElementId(this.id, CARD_ELEMENTS_KIND.title);
		const descriptionId = getElementId(this.id, CARD_ELEMENTS_KIND.description);

		const isClickable = this.state.props.clickable ?? false;
		const isDisabled = this.state.props.disabled ?? false;

		return {
			id,
			role: isClickable ? 'button' : undefined,
			tabindex: isClickable && !isDisabled ? 0 : undefined,
			'aria-labelledby': titleId,
			'aria-describedby': descriptionId,
			'aria-disabled': isDisabled,
			'data-kind': CARD_ELEMENTS_KIND.root,
			...props,
			[createAttachmentKey()]: (node: HTMLElement) => {
				this.elements.root = node;
			}
		};
	}

	header(props: Record<string, unknown> = {}) {
		const id = getElementId(this.id, CARD_ELEMENTS_KIND.header);
		return {
			id,
			'data-kind': CARD_ELEMENTS_KIND.header,
			...props,
			[createAttachmentKey()]: (node: HTMLElement) => {
				this.elements.header = node;
			}
		};
	}

	title(props: Record<string, unknown> = {}) {
		const id = getElementId(this.id, CARD_ELEMENTS_KIND.title);
		return {
			id,
			'data-kind': CARD_ELEMENTS_KIND.title,
			...props,
			[createAttachmentKey()]: (node: HTMLElement) => {
				this.elements.title = node;
			}
		};
	}

	subtitle(props: Record<string, unknown> = {}) {
		const id = getElementId(this.id, CARD_ELEMENTS_KIND.subtitle);
		return {
			id,
			'data-kind': CARD_ELEMENTS_KIND.subtitle,
			...props,
			[createAttachmentKey()]: (node: HTMLElement) => {
				this.elements.subtitle = node;
			}
		};
	}

	description(props: Record<string, unknown> = {}) {
		const id = getElementId(this.id, CARD_ELEMENTS_KIND.description);
		return {
			id,
			'data-kind': CARD_ELEMENTS_KIND.description,
			...props,
			[createAttachmentKey()]: (node: HTMLElement) => {
				this.elements.description = node;
			}
		};
	}

	content(props: Record<string, unknown> = {}) {
		const id = getElementId(this.id, CARD_ELEMENTS_KIND.content);
		return {
			id,
			'data-kind': CARD_ELEMENTS_KIND.content,
			...props,
			[createAttachmentKey()]: (node: HTMLElement) => {
				this.elements.content = node;
			}
		};
	}

	media(props: Record<string, unknown> = {}) {
		const id = getElementId(this.id, CARD_ELEMENTS_KIND.media);
		return {
			id,
			'data-kind': CARD_ELEMENTS_KIND.media,
			...props,
			[createAttachmentKey()]: (node: HTMLElement) => {
				this.elements.media = node;
			}
		};
	}

	actions(props: Record<string, unknown> = {}) {
		const id = getElementId(this.id, CARD_ELEMENTS_KIND.actions);
		return {
			id,
			'data-kind': CARD_ELEMENTS_KIND.actions,
			...props,
			[createAttachmentKey()]: (node: HTMLElement) => {
				this.elements.actions = node;
			}
		};
	}

	footer(props: Record<string, unknown> = {}) {
		const id = getElementId(this.id, CARD_ELEMENTS_KIND.footer);
		return {
			id,
			'data-kind': CARD_ELEMENTS_KIND.footer,
			...props,
			[createAttachmentKey()]: (node: HTMLElement) => {
				this.elements.footer = node;
			}
		};
	}
}
