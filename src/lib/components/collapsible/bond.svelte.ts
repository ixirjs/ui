/**
 * Collapsible's shared object — a plain state class on the redesigned `Kernel`.
 *
 * Same surface the family always had (`{ collapsible }`, `getBond`, `factory`, `open`/`close`/
 * `toggle`, `isOpen`, `parent` for nesting), none of the runtime: no capability registry, no node
 * registry, no Atoms. Cross-part ARIA is derived from the seed rather than resolved through a
 * registry, so the header names the body on the server too. `docs/research/whiteboard-2026-08.md`.
 */
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import { createDisclosure, type Disclosure } from '$ixirjs/ui/capability/models/disclosure.svelte';
import type { StateChangeContext } from '$ixirjs/ui/types';

export type CollapsibleBondProps = {
	id?: string | undefined;
	open: boolean;
	disabled?: boolean | undefined;
	value?: string | undefined;
	data?: unknown;
};

export const CollapsibleContext = Kernel.context<CollapsibleBond>('bond/collapsible');

type Commit = (next: boolean, context: StateChangeContext<CollapsibleBond>) => void;

function optionalParent(): CollapsibleBond | undefined {
	// Outside component init (a unit test, a bench) there is no context to read.
	try {
		return CollapsibleContext.get();
	} catch {
		return undefined;
	}
}

export class CollapsibleBond {
	readonly name = 'collapsible';
	readonly props: CollapsibleBondProps;
	readonly disclosure: Disclosure;
	readonly #parent: CollapsibleBond | undefined;
	#openChangeContext: Pick<StateChangeContext, 'event' | 'reason'> | undefined;
	#commit: Commit | undefined;

	constructor(props: CollapsibleBondProps, parent?: CollapsibleBond) {
		this.props = props;
		this.#parent = parent ?? optionalParent();
		this.disclosure = createDisclosure({
			get: () => this.props.open,
			set: (open) => this.#set(open)
		});
	}

	static create(props: CollapsibleBondProps): CollapsibleBond {
		return new CollapsibleBond(props);
	}

	/** @internal The root wires how a new open state is written and reported. */
	bindCommit(commit: Commit): void {
		this.#commit = commit;
	}

	/** The family's identity seed — the root's `$props.id()`. */
	get id(): string {
		return this.props.id ?? 'collapsible';
	}
	get rootId(): string {
		return Kernel.id(this.id, 'collapsible-root');
	}
	get headerId(): string {
		return Kernel.id(this.id, 'collapsible-header');
	}
	get bodyId(): string {
		return Kernel.id(this.id, 'collapsible-body');
	}
	get indicatorId(): string {
		return Kernel.id(this.id, 'collapsible-indicator');
	}
	get parent(): CollapsibleBond | undefined {
		return this.#parent;
	}
	get isOpen(): boolean {
		return this.disclosure.isOpen;
	}
	get isDisabled(): boolean {
		return this.props.disabled ?? false;
	}
	/** The root element, by the id it renders. */
	get element(): HTMLElement | undefined {
		return typeof document === 'undefined'
			? undefined
			: (document.getElementById(this.rootId) ?? undefined);
	}

	open(): void {
		this.disclosure.open();
	}
	close(): void {
		this.disclosure.close();
	}
	toggle(): void {
		this.disclosure.toggle();
	}

	/**
	 * Staged rather than passed: the gesture that toggles knows the event and the reason, and the
	 * write happens one call later, inside the disclosure model.
	 */
	stageOpenChange(context: Pick<StateChangeContext, 'event' | 'reason'>): void {
		this.#openChangeContext = context;
	}

	#set(open: boolean): void {
		// Equality-gated: `close()` on a closed collapsible is not a transition and reports nothing.
		if (open === this.props.open) return;
		const context = { ...this.#openChangeContext, bond: this } as StateChangeContext<this>;
		this.#openChangeContext = undefined;
		if (this.#commit) this.#commit(open, context as StateChangeContext<CollapsibleBond>);
		else this.props.open = open;
	}
}
