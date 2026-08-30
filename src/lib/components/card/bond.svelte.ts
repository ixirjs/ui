/**
 * Card's shared object — a plain state class on the redesigned `Kernel`.
 *
 * It keeps the name and the surface the family always had (`{ card }` in snippets, `getBond`,
 * `factory`, `CardBond.create`) and none of the runtime: no capability registry, no node registry,
 * no Atoms. The one relationship the card projects — the root's `aria-labelledby`/`aria-describedby`
 * to a Title/Description that may or may not render — is a child writing its id into one `$state`
 * field here. `docs/research/whiteboard-2026-08.md`.
 */
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';

export type CardBondProps = {
	id?: string;
	disabled?: boolean;
	clickable?: boolean;
};

export const CardContext = Kernel.context<CardBond>('bond/card');

export class CardBond {
	readonly name = 'card';
	readonly props: CardBondProps;
	/** The Title's element id, once one has rendered. */
	titleId = $state<string | undefined>();
	/** The Description's element id, once one has rendered. */
	descriptionId = $state<string | undefined>();

	constructor(props: CardBondProps = {}) {
		this.props = props;
	}

	/** The family's identity seed — the root's `$props.id()`. */
	get id(): string {
		return this.props.id ?? 'card';
	}
	get rootId(): string {
		return Kernel.id(this.id, 'card-root');
	}
	get isDisabled(): boolean {
		return this.props.disabled ?? false;
	}
	get isClickable(): boolean {
		return this.props.clickable ?? false;
	}
	/** The root element, by the id it renders. */
	get element(): HTMLElement | undefined {
		return typeof document === 'undefined'
			? undefined
			: (document.getElementById(this.rootId) ?? undefined);
	}

	static create(props: CardBondProps = {}): CardBond {
		return new CardBond(props);
	}
}
