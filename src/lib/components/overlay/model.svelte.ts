/**
 * The overlay's shared object on the redesigned `Kernel` — a plain state class.
 *
 * Modal/host families extend it; popup families implement the structural OverlayState contract. It owns
 * the open/disabled/modal facts, the controlled commit the root wires, the staged reason a policy
 * hands to the next `onopenchange`, and the ids of the parts that rendered — written by each part
 * at its init, so cross-part ARIA (`aria-controls`, `aria-labelledby`) and dismissal geometry
 * (`element('content')`) resolve without a registry. Behaviour lives in `behavior.svelte.ts` as
 * functions over this class.
 */
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import type { StateChangeContext } from '$ixirjs/ui/types';

export type OverlayProps = {
	id?: string | undefined;
	open?: boolean | undefined;
	/** Disables the control: it stops responding and is removed from the tab order. */
	disabled?: boolean | undefined;
	/** Whether this overlay applies modal ARIA, focus, and document effects. */
	modal?: boolean | undefined;
};

export type OverlayOpenChange = Pick<StateChangeContext, 'event' | 'reason'>;

/** What the overlay stack, the portal surface and the policies need from an overlay. */
export interface OverlayLike {
	readonly isOpen: boolean;
	readonly isDisabled: boolean;
	readonly modal?: boolean;
	open(): void;
	close(): void;
	toggle(): void;
}

/** The parts an overlay family may render; policies address elements by part. */
export type OverlayPart =
	| 'root'
	| 'trigger'
	| 'content'
	| 'overlay'
	| 'backdrop'
	| 'title'
	| 'description'
	| 'tail'
	| 'indicator';

// Canonical overlay config value-types; per-policy options pick from these via indexed access.
export type OverlayKnobs = {
	// trigger's aria-haspopup value.
	ariaHasPopup?: 'dialog' | 'menu' | 'listbox' | 'tree' | 'grid' | true | false;
	// Where focus returns when the overlay closes.
	restoreFocus?: 'trigger' | 'previous' | 'none' | (() => HTMLElement | null);
	// Whether opening captures `document.activeElement` for restoration.
	captureFocusOnOpen?: boolean;
};

export type EscapeOutcome = 'close' | 'ignore' | 'clear-and-close' | 'handled';

type Commit<B> = (open: boolean, context: StateChangeContext<B>) => void;

/** Structural contract shared by popup and modal implementations. */
export interface OverlayState<Props extends OverlayProps = OverlayProps> extends OverlayLike {
	readonly name: string;
	readonly props: Props;
	readonly id: string;
	readonly ids: Partial<Record<OverlayPart, string>>;
	readonly modal: boolean;
	bindCommit(commit: Commit<this>): void;
	stageOpenChange(context: OverlayOpenChange): void;
	takeOpenChangeContext(): OverlayOpenChange;
	attachPart(part: OverlayPart, id: string): () => void;
	partId(part: OverlayPart): string | undefined;
	element(part: OverlayPart): HTMLElement | null;
}

/** The nearest overlay host — what a nested popover gates its own `open` on. */
export const OverlayContext = Kernel.context<OverlayState>('popover-owner');

export class OverlayBond<Props extends OverlayProps = OverlayProps> implements OverlayLike {
	readonly name: string;
	readonly props: Props;
	/** Ids of the parts that rendered, keyed by part; each part writes its own at init. */
	readonly ids = $state<Partial<Record<OverlayPart, string>>>({});
	// `Commit<never>`, not `Commit<this>`: a `this`-typed private field makes every subclass with
	// members of its own un-assignable to `OverlayBond`, which is what every behaviour function takes.
	#commit: Commit<never> | undefined;
	#staged: OverlayOpenChange | undefined;

	constructor(props: Props, name = 'overlay') {
		this.props = props;
		this.name = name;
	}

	// Standalone overlay whose `isOpen` delegates to an outer host. Used by OverlayPortal so the
	// host context inside its subtree is the portal's own.
	static create(outer?: OverlayLike): OverlayBond {
		const props: OverlayProps = {
			get open() {
				return outer?.isOpen ?? true;
			},
			set open(_value: boolean | undefined) {}
		};
		return new OverlayBond(props);
	}

	/** @internal The root wires how `open` is written and reported. */
	bindCommit(commit: Commit<this>): void {
		this.#commit = commit;
	}

	get id(): string {
		return this.props.id ?? this.name;
	}
	get isOpen(): boolean {
		return this.props.open ?? false;
	}
	get isDisabled(): boolean {
		return this.props.disabled ?? false;
	}
	get modal(): boolean {
		return this.props.modal ?? true;
	}

	open(): void {
		if (this.isDisabled) return;
		this.#set(true);
	}
	close(): void {
		this.#set(false);
	}
	toggle(): void {
		if (this.isOpen) this.close();
		else this.open();
	}
	#set(open: boolean): void {
		if (open === this.isOpen) return;
		if (this.#commit) {
			const context = { ...this.takeOpenChangeContext(), bond: this } as StateChangeContext<never>;
			this.#commit(open, context);
		} else this.props.open = open;
	}

	// Staged rather than passed: the policy that closes an overlay (escape, outside press,
	// backdrop) writes `open`, which takes no argument. It stages the reason here and the root's
	// commit takes it back on the same tick.
	stageOpenChange(context: OverlayOpenChange): void {
		this.#staged = context;
		queueMicrotask(() => {
			if (this.#staged === context) this.#staged = undefined;
		});
	}
	takeOpenChangeContext(): OverlayOpenChange {
		const context = this.#staged ?? {};
		this.#staged = undefined;
		return context;
	}

	/** A part announces the id it rendered; returns the release for `$effect(() => release)`. */
	attachPart(part: OverlayPart, id: string): () => void {
		this.ids[part] = id;
		return () => {
			if (this.ids[part] === id) delete this.ids[part];
		};
	}
	partId(part: OverlayPart): string | undefined {
		return this.ids[part];
	}
	/** The rendered element for a part, by its announced id. */
	element(part: OverlayPart): HTMLElement | null {
		const id = this.ids[part];
		return id !== undefined && typeof document !== 'undefined' ? document.getElementById(id) : null;
	}
}
