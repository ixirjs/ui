import { Bond, Atom, defineAtom } from '$ixirjs/ui/shared/bond';
import { defineBond, type BondOf } from '$ixirjs/ui/shared';
import {
	createDisclosure,
	disclosureCapability,
	disclosureTrigger,
	type Disclosure
} from '$ixirjs/ui/shared/capability/models/disclosure.svelte';
import type { DisclosureStateProps } from '$ixirjs/ui/shared/capability/models/disclosure-state.svelte';
import { treeItemGroupLink } from '$ixirjs/ui/shared/capability/models/relationship.svelte';
import {
	createRovingFocus,
	rovingCapability,
	type RovingFocus
} from '$ixirjs/ui/shared/capability/models/roving.svelte';
import { navigationCapability } from '$ixirjs/ui/shared/capability/models/navigation.svelte';
import type { Capability } from '$ixirjs/ui/shared/capability';
import type { Collection } from '$ixirjs/ui/shared/bond/collection.svelte';
import { isBrowser } from '$ixirjs/ui/utils/dom.svelte';
import type { StateChangeContext } from '$ixirjs/ui/types';

export type TreeBondProps = DisclosureStateProps;

// The keyboard seam a node reaches through its outermost ancestor.
export interface ITreeKeyboard {
	readonly focusedId: string | null;
	keyboardCapabilities(): readonly Capability[];
	notifyFocused(id: string): void;
	focusNode(id: string | null | undefined): void;
}

// Narrow node contract the keyboard model walks. Nodes talk to their parent through this rather
// than through `TreeBond`: `TreeBond` is derived from this class, so naming it inside a member
// type makes the class circular and TS quietly resolves the lot to `any` — which is then what the
// generated docs prop tables print for every consumer-facing type on the family.
export interface ITreeNode extends ITreeKeyboard {
	readonly keyboardOwner: ITreeKeyboard;
	attachChild(id: string, node: ITreeNode): () => void;
	readonly props: TreeBondProps;
	readonly headerId: string | undefined;
	readonly isOpen: boolean;
	readonly visibleHeaderIds: readonly string[];
	// The first entry of `visibleHeaderIds`, without building the list. OPTIONAL so an existing
	// external implementor of this contract keeps compiling; callers fall back to the list.
	readonly firstVisibleHeaderId?: string | undefined;
}

// Minimal bond view — breaks the atom↔bond cycle.

class TreeRootAtom extends Atom<TreeBondBase, HTMLElement> {
	constructor(bond: TreeBondBase) {
		super(bond, 'root');
	}
	// Registers this node with its parent node. Keyboard order is the parent's registration
	// order, which is mount order, which is document order — no DOM query needed.
	override onmount(): (() => void) | undefined {
		return this.requireBond().attachToParent();
	}
	override get attrs() {
		const bond = this.requireBond();
		const props = bond?.props;
		const isDisabled = props?.disabled ?? false;

		// aria-expanded lives on the header (trigger↔content link); root labelled by the header.
		return {
			...super.attrs,
			'aria-labelledby': bond.nodeByRole('treeitem')?.id,
			'aria-disabled': isDisabled
		};
	}
}

class TreeHeaderAtom extends Atom<TreeBondBase, HTMLElement> {
	constructor(bond: TreeBondBase) {
		super(bond, 'header');
		this.role('treeitem');
	}
	override get attrs() {
		const bond = this.requireBond();
		// Roving tabindex over the visible treeitems — exactly one node is in the tab order, and
		// arrows move between them. Keying it to "is a <button>" left a div-headed tree, which is
		// the documented shape, with no focusable node at all.
		const focused = bond.keyboardOwner.focusedId === this.id;
		// The treeitem relationship owns the semantic role; do not compete with it by
		// projecting a native button role for non-button headers.
		return {
			...super.attrs,
			tabindex: bond.props.disabled || !focused ? -1 : 0
		};
	}
	override get handlers() {
		const bond = this.requireBond();
		return {
			...super.handlers,
			onfocus: () => bond.keyboardOwner.notifyFocused(this.id),
			// Horizontal arrows on a tree are expand/collapse, not "move the highlight", so they
			// stay here rather than in the shared navigation capability. Vertical arrows and
			// Home/End come from that capability, projected onto role 'treeitem'.
			onkeydown: (event: KeyboardEvent) => {
				if (event.defaultPrevented) return;
				if (event.key === 'ArrowRight') {
					if (!bond.isOpen && bond.hasChildren) bond.open();
					else if (bond.isOpen) bond.keyboardOwner.focusNode(bond.firstChildHeaderId);
					else return;
				} else if (event.key === 'ArrowLeft') {
					if (bond.isOpen) bond.close();
					else bond.keyboardOwner.focusNode(bond.parentHeaderId);
				} else return;
				event.preventDefault();
			}
		};
	}
}

class TreeBodyAtom extends Atom<TreeBondBase, HTMLElement> {
	constructor(bond: TreeBondBase) {
		super(bond, 'body');
		this.role('treegroup');
	}
	// No `attrs` override: aria-labelledby + role=group come from the trigger↔content link
	// (role:'content'). Spreading `super.attrs` into a fresh object added one allocation per tree
	// body per render to reproduce it exactly.
}

const TreeIndicatorAtom = defineAtom<TreeBondBase, HTMLElement>('indicator');

// Captures the parent tree bond from context, enabling nesting.

class TreeBondBase extends Bond<TreeBondProps> {
	#parent: TreeBond | undefined;
	// The same object as `#parent`, seen through the narrow contract. See `ITreeNode`.
	#parentNode: ITreeNode | undefined;
	#openChangeContext: Pick<StateChangeContext, 'event' | 'reason'> | undefined;
	readonly disclosure: Disclosure = createDisclosure({
		get: () => this.props.open,
		set: (v) => (this.props.open = v)
	});

	// Explicitly initialised, because `focusedId` below is a `$derived` field and TypeScript models
	// every field initialiser as running eagerly in declaration order. `$derived` is lazy, so this is
	// a no-op at runtime — but an implicitly-undefined field reads as "used before initialisation".
	#roving: RovingFocus<string> | undefined = undefined;
	#keyboard: readonly Capability[];

	constructor(props: TreeBondProps, name = 'tree') {
		super(props, name);
		this.#parent = TreeBond.getOptional();
		this.#parentNode = this.#parent as unknown as ITreeNode | undefined;
		// Eagerly create the owned collection outside derived reads; collection() registers a capability.
		void this.children;
		this.capability(disclosureCapability(this.disclosure));
		// treeitem↔group link: header gets aria-expanded/controls; body gets aria-labelledby/group.
		this.capability(treeItemGroupLink());
		this.capability(disclosureTrigger({ event: 'pointerdown' }));
		// One roving over the whole tree, owned by the outermost node: navigation crosses node
		// boundaries, so a per-node model would only ever see its own subtree. Nested nodes
		// re-register the owner's instances so their header atoms can project them.
		this.#keyboard = this.#parentNode
			? this.#parentNode.keyboardCapabilities()
			: this.#createKeyboardCapabilities();
		for (const capability of this.#keyboard) this.capability(capability);
	}

	#createKeyboardCapabilities(): readonly Capability[] {
		const roving = createRovingFocus<string>({
			ids: () => this.visibleHeaderIds,
			item: (id) => id
		});
		this.#roving = roving;
		return [
			// Registered to satisfy navigation's `requires: [ROVING]`. No atom claims role
			// 'container', so no aria-activedescendant is emitted: treeitems take real DOM focus.
			rovingCapability(roving),
			navigationCapability(roving, {
				roles: ['treeitem'],
				orientation: 'vertical',
				preventScroll: true,
				onMove: (id) => this.focusNode(id)
			})
		];
	}

	get parent(): TreeBond | undefined {
		return this.#parent;
	}

	// The outermost node — it owns the roving model the whole tree navigates by.
	get keyboardOwner(): ITreeKeyboard {
		return this.#parentNode?.keyboardOwner ?? this;
	}

	keyboardCapabilities(): readonly Capability[] {
		return this.#keyboard;
	}

	// Child nodes in mount order.
	get children(): Collection<ITreeNode> {
		return this.collection<ITreeNode>('child');
	}

	attachChild(id: string, node: ITreeNode): () => void {
		return this.children.set(id, node);
	}

	attachToParent(): (() => void) | undefined {
		return this.#parentNode?.attachChild(this.id, this);
	}

	get hasChildren(): boolean {
		return this.children.size > 0;
	}

	get headerId(): string | undefined {
		return this.nodeByPart('header')?.id;
	}

	get parentHeaderId(): string | undefined {
		return this.#parentNode?.headerId;
	}

	get firstChildHeaderId(): string | undefined {
		return this.children.values.find((child) => !child.props.disabled)?.headerId;
	}

	/**
	 * Every treeitem the user can currently reach, in document order: a node, then its children when
	 * it is open. Collapsed subtrees are skipped, which is what "visible" means to a keyboard.
	 *
	 * `$derived` **per node**, so the recursion memoizes per SUBTREE: a change under one node
	 * invalidates that node and its ancestors, not every node in the tree. As a plain getter this
	 * rebuilt the whole list on every read — recursively, allocating an array at each level and
	 * spreading each child's array into its parent's — and every node's header is a reader through
	 * `focusedId`. Mounting a 400-node tree took 13.6 s at k = 2.51 (worse than quadratic, because
	 * the spread makes one full walk O(n·depth) on its own).
	 */
	readonly visibleHeaderIds: readonly string[] = $derived.by(() => {
		if (this.props.disabled) return [];
		const own = this.headerId;
		const ids = own ? [own] : [];
		if (!this.isOpen) return ids;
		for (const child of this.children.values) ids.push(...child.visibleHeaderIds);
		return ids;
	});

	/**
	 * `visibleHeaderIds[0]`, found by early return instead of by building the list.
	 *
	 * This is what `focusedId` needs, and for the outermost node — the only one whose `focusedId` is
	 * ever read — it is answered by that node's own header, so it costs O(1) and never touches the
	 * collection at all. Taking `[0]` off the full list instead made the tree-wide walk a dependency
	 * of every header.
	 */
	get firstVisibleHeaderId(): string | undefined {
		if (this.props.disabled) return undefined;
		const own = this.headerId;
		if (own) return own;
		if (!this.isOpen) return undefined;
		for (const child of this.children.values) {
			const found = child.firstVisibleHeaderId ?? child.visibleHeaderIds[0];
			if (found) return found;
		}
		return undefined;
	}

	/**
	 * The treeitem holding the roving tabindex. Falls back to the first visible node, so a tree
	 * nobody has focused yet is still reachable with a single Tab — including in SSR output, where
	 * the collection is still empty and the outermost header is the only candidate.
	 *
	 * `$derived` for the reason `AccordionBondBase.focusedId` is: it is an **equality gate**, not a
	 * memo. Every node's header atom reads this, so a plain getter let a child registration
	 * invalidate every header already mounted. As a derived it recomputes to the same string and
	 * Svelte stops the propagation. Keep the value primitive — the gate is `===` on it.
	 */
	readonly focusedId: string | null = $derived(
		this.#roving?.activeId ?? this.firstVisibleHeaderId ?? null
	);

	notifyFocused(id: string): void {
		this.#roving?.goto(id);
	}

	focusNode(id: string | null | undefined): void {
		if (!id || !isBrowser()) return;
		document.getElementById(id)?.focus();
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

	get isOpen(): boolean {
		return this.disclosure.isOpen;
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

export const TreeBond = defineBond({
	name: 'tree',
	base: TreeBondBase,
	atoms: {
		root: { atom: TreeRootAtom },
		header: { atom: TreeHeaderAtom, role: 'trigger' },
		body: { atom: TreeBodyAtom, role: 'content' },
		indicator: TreeIndicatorAtom
	}
});

export type TreeBond = BondOf<typeof TreeBond>;
