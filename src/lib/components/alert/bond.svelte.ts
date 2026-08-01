import {
	bondContextKey,
	Bond,
	BondState,
	type BondStateProps
} from '$svelte-atoms/core/shared/bond.svelte';
import { createAttachmentKey } from 'svelte/attachments';

export type AlertBondProps = BondStateProps & {
	disabled?: boolean;
	extend?: Record<string, unknown>;
};

export type AlertBondElements = {
	root: HTMLElement;
	icon: HTMLElement;
	title: HTMLElement;
	description: HTMLElement;
	content: HTMLElement;
	actions: HTMLElement;
	closeButton: HTMLElement;
};

export class AlertBond<
	State extends AlertBondState<AlertBondProps> = AlertBondState<AlertBondProps>
> extends Bond<AlertBondProps, State> {
	static CONTEXT_KEY = bondContextKey('alert');

	constructor(s: State) {
		super(s);
	}

	root(props: Record<string, unknown> = {}) {
		const disabled = this.state.props.disabled ?? false;

		return {
			id: `alert-root-${this.id}`,
			role: 'alert',
			'aria-labelledby': `alert-title-${this.id}`,
			'aria-describedby': `alert-description-${this.id}`,
			'aria-disabled': disabled,
			...props,
			[createAttachmentKey()]: (node: HTMLElement) => {
				this.elements.root = node;
			}
		};
	}

	icon(props: Record<string, unknown> = {}) {
		return {
			id: `alert-icon-${this.id}`,
			'aria-hidden': true,
			...props,
			[createAttachmentKey()]: (node: HTMLElement) => {
				this.elements.icon = node;
			}
		};
	}

	title(props: Record<string, unknown> = {}) {
		return {
			id: `alert-title-${this.id}`,
			...props,
			[createAttachmentKey()]: (node: HTMLElement) => {
				this.elements.title = node;
			}
		};
	}

	description(props: Record<string, unknown> = {}) {
		return {
			id: `alert-description-${this.id}`,
			...props,
			[createAttachmentKey()]: (node: HTMLElement) => {
				this.elements.description = node;
			}
		};
	}

	content(props: Record<string, unknown> = {}) {
		return {
			id: `alert-content-${this.id}`,
			...props,
			[createAttachmentKey()]: (node: HTMLElement) => {
				this.elements.content = node;
			}
		};
	}

	actions(props: Record<string, unknown> = {}) {
		return {
			id: `alert-actions-${this.id}`,
			...props,
			[createAttachmentKey()]: (node: HTMLElement) => {
				this.elements.actions = node;
			}
		};
	}

	closeButton(props: Record<string, unknown> = {}) {
		return {
			id: `alert-close-button-${this.id}`,
			type: 'button',
			'aria-label': 'Dismiss alert',
			...props,
			[createAttachmentKey()]: (node: HTMLElement) => {
				this.elements.closeButton = node;
			}
		};
	}
}

export class AlertBondState<Props extends AlertBondProps> extends BondState<Props> {
	constructor(props: Props) {
		super(props);
	}
}
