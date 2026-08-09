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
	override get attrs() {
		// aria-labelledby + role=group come from the trigger↔content link (role:'content').
		return {
			...super.attrs
		};
	}
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

	#roving: RovingFocus<string> | undefined;
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

	// Every treeitem the user can currently reach, in document order: a node, then its children
	// when it is open. Collapsed subtrees are skipped, which is what "visible" means to a keyboard.
	get visibleHeaderIds(): readonly string[] {
		if (this.props.disabled) return [];
		const own = this.headerId;
		const ids = own ? [own] : [];
		if (!this.isOpen) return ids;
		for (const child of this.children.values) ids.push(...child.visibleHeaderIds);
		return ids;
	}

	// The treeitem holding the roving tabindex. Falls back to the first visible node, so a tree
	// nobody has focused yet is still reachable with a single Tab — including in SSR output,
	// where the collection is still empty and the outermost header is the only candidate.
	get focusedId(): string | null {
		return this.#roving?.activeId ?? this.visibleHeaderIds[0] ?? null;
	}

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
