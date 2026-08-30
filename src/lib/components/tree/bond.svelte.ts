/**
 * A tree node's shared object — a plain state class on the redesigned `Kernel`.
 *
 * Same surface the family always had (`{ tree }`, `getBond`, `factory`, `open`/`close`/`toggle`,
 * `isOpen`, `hasChildren`, `visibleHeaderIds`, `focusedId`), none of the runtime. A node takes its
 * parent from context, registers with it at its root's init (document order) and shares one roving
 * model owned by the outermost node. Cross-part ARIA is a part writing its id into `$state` here.
 * `docs/research/whiteboard-2026-08.md`.
 */
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import { createDisclosure, type Disclosure } from '$ixirjs/ui/capability/models/disclosure.svelte';
import { createRovingFocus, type RovingFocus } from '$ixirjs/ui/capability/models/roving.svelte';
import type { PresetLike } from '$ixirjs/ui/preset';
import type { StateChangeContext } from '$ixirjs/ui/types';

export type TreeBondProps = {
	id?: string | undefined;
	open: boolean;
	disabled?: boolean | undefined;
	presets?:
		| { root?: PresetLike; header?: PresetLike; body?: PresetLike; indicator?: PresetLike }
		| undefined;
};

/** The keyboard seam a node reaches through its outermost ancestor. */
export interface ITreeKeyboard {
	readonly focusedId: string | null;
	/** `null` forgets the highlight — a focused node that unmounted. */
	notifyFocused(id: string | null): void;
	focusNode(id: string | null | undefined): void;
	/** Up/Down/Home/End over the visible treeitems. Returns whether the key was handled. */
	move(key: string): boolean;
}

/**
 * Narrow node contract the keyboard model walks. Nodes talk to their parent through this rather
 * than through `TreeBond`, so the class stays non-circular and the generated docs keep their types.
 */
export interface ITreeNode extends ITreeKeyboard {
	readonly keyboardOwner: ITreeKeyboard;
	attachChild(id: string, node: ITreeNode): () => void;
	readonly props: TreeBondProps;
	readonly headerId: string | undefined;
	readonly isOpen: boolean;
	readonly visibleHeaderIds: readonly string[];
	readonly firstVisibleHeaderId?: string | undefined;
}

export const TreeContext = Kernel.context<TreeBond>('bond/tree');

type Commit = (next: boolean, context: StateChangeContext<TreeBond>) => void;

function optionalParent(): ITreeNode | undefined {
	// Outside component init (a unit test, a bench) there is no context to read.
	try {
		return TreeContext.get();
	} catch {
		return undefined;
	}
}

export class TreeBond implements ITreeNode {
	readonly name = 'tree';
	readonly props: TreeBondProps;
	/** Child nodes in mount order. */
	readonly items = new Map<string, ITreeNode>();
	readonly disclosure: Disclosure;
	/** The header's element id, once one has rendered. */
	headerId = $state<string | undefined>();
	/** The body's element id, once one has rendered. */
	bodyId = $state<string | undefined>();
	readonly #parent: ITreeNode | undefined;
	// Resolved once, not walked: the parent already holds ITS owner, so this is O(1) per node.
	readonly #owner: ITreeKeyboard;
	// One roving over the whole tree, owned by the outermost node: navigation crosses node
	// boundaries, so a per-node model would only ever see its own subtree. Explicitly initialised
	// because `focusedId` below is a `$derived` field and TypeScript models every field initialiser
	// as running eagerly in declaration order; `$derived` is lazy, so this is a no-op at runtime.
	#roving: RovingFocus<string> | undefined = undefined;
	#openChangeContext: Pick<StateChangeContext, 'event' | 'reason'> | undefined;
	#commit: Commit | undefined;

	constructor(props: TreeBondProps, parent?: ITreeNode) {
		this.props = props;
		this.#parent = parent ?? optionalParent();
		this.#owner = this.#parent?.keyboardOwner ?? this;
		this.disclosure = createDisclosure({
			get: () => this.props.open,
			set: (open) => this.#set(open)
		});
		this.#roving = this.#parent
			? undefined
			: createRovingFocus<string>({ ids: () => this.visibleHeaderIds, item: (id) => id });
	}

	static create(props: TreeBondProps): TreeBond {
		return new TreeBond(props);
	}

	/** @internal The root wires how a new open state is written and reported. */
	bindCommit(commit: Commit): void {
		this.#commit = commit;
	}

	get id(): string {
		return this.props.id ?? 'tree';
	}
	get rootId(): string {
		return Kernel.id(this.id, 'tree-root');
	}
	get parent(): ITreeNode | undefined {
		return this.#parent;
	}
	/** The outermost node — it owns the roving model the whole tree navigates by. */
	get keyboardOwner(): ITreeKeyboard {
		return this.#owner;
	}
	get isOpen(): boolean {
		return this.disclosure.isOpen;
	}
	get isDisabled(): boolean {
		return this.props.disabled ?? false;
	}
	get hasChildren(): boolean {
		return this.items.size > 0;
	}
	get parentHeaderId(): string | undefined {
		return this.#parent?.headerId;
	}
	get firstChildHeaderId(): string | undefined {
		for (const child of this.items.values()) if (!child.props.disabled) return child.headerId;
		return undefined;
	}

	attachChild(id: string, node: ITreeNode): () => void {
		this.items.set(id, node);
		return () => {
			this.items.delete(id);
			// The map is not reactive, so a removed node must release the highlight it held.
			if (node.headerId && this.#owner.focusedId === node.headerId) this.#owner.notifyFocused(null);
		};
	}
	attachToParent(): (() => void) | undefined {
		return this.#parent?.attachChild(this.id, this);
	}

	/**
	 * Every treeitem the user can currently reach, in document order: a node, then its children when
	 * it is open. Read on a key press, never per render — `focusedId` answers from
	 * `firstVisibleHeaderId` without building it.
	 */
	get visibleHeaderIds(): readonly string[] {
		if (this.props.disabled) return [];
		const own = this.headerId;
		const ids = own ? [own] : [];
		if (!this.isOpen) return ids;
		for (const child of this.items.values()) ids.push(...child.visibleHeaderIds);
		return ids;
	}

	/** `visibleHeaderIds[0]` by early return — O(1) for a node with its own header. */
	get firstVisibleHeaderId(): string | undefined {
		if (this.props.disabled) return undefined;
		const own = this.headerId;
		if (own) return own;
		if (!this.isOpen) return undefined;
		for (const child of this.items.values()) {
			const found = child.firstVisibleHeaderId ?? child.visibleHeaderIds[0];
			if (found) return found;
		}
		return undefined;
	}

	/**
	 * The treeitem holding the roving tabindex; falls back to the first visible node so an
	 * unfocused tree is still one Tab away. `$derived` as an equality gate: every header reads it,
	 * so a recompute to the same string stops there. Keep the value primitive.
	 */
	readonly focusedId: string | null = $derived(
		this.#roving?.activeId ?? this.firstVisibleHeaderId ?? null
	);

	notifyFocused(id: string | null): void {
		if (id === null) this.#roving?.clear();
		else this.#roving?.goto(id);
	}
	focusNode(id: string | null | undefined): void {
		if (!id || typeof document === 'undefined') return;
		document.getElementById(id)?.focus();
	}
	move(key: string): boolean {
		const roving = this.#roving;
		if (!roving) return false;
		let next: string | null;
		if (key === 'ArrowDown') next = roving.next();
		else if (key === 'ArrowUp') next = roving.previous();
		else if (key === 'Home') next = roving.first();
		else if (key === 'End') next = roving.last();
		else return false;
		this.focusNode(next);
		return true;
	}

	stageOpenChange(context: Pick<StateChangeContext, 'event' | 'reason'>): void {
		this.#openChangeContext = context;
		queueMicrotask(() => {
			if (this.#openChangeContext === context) this.#openChangeContext = undefined;
		});
	}
	takeOpenChangeContext(): Pick<StateChangeContext, 'event' | 'reason'> {
		const context = this.#openChangeContext ?? {};
		this.#openChangeContext = undefined;
		return context;
	}

	#set(next: boolean): void {
		if (next === this.props.open) return;
		const context = { bond: this, ...this.takeOpenChangeContext() };
		if (this.#commit) this.#commit(next, context);
		else this.props.open = next;
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
}
