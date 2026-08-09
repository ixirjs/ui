import type { Collection } from '$ixirjs/ui/shared/bond/collection.svelte';
import {
	createSelection,
	type SelectionModel
} from '$ixirjs/ui/shared/capability/models/selection.svelte';
import {
	createRovingFocus,
	rovingCapability,
	type RovingFocus
} from '$ixirjs/ui/shared/capability/models/roving.svelte';
import { navigationCapability } from '$ixirjs/ui/shared/capability/models/navigation.svelte';
import type { Capability } from '$ixirjs/ui/shared/capability';
import { Bond, defineAtom, type BondStateProps } from '$ixirjs/ui/shared/bond';
import { defineBond, type BondOf } from '$ixirjs/ui/shared';

export type AccordionBondProps = BondStateProps & {
	open: boolean;
	value?: string;
	values: string[];
	multiple?: boolean;
	collapsible?: boolean;
	disabled: boolean;
};

export type AccordionItemHandle = {
	readonly id: string;
	readonly isDisabled?: boolean;
	// Registered part elements — the header is what keyboard navigation focuses.
	readonly elements?: Record<string, unknown>;
};

// Narrow parent contract an item child depends on; keeps the child→parent seam stub-testable.

export interface IAccordion {
	readonly id: string;
	readonly values: readonly string[];
	readonly isDisabled: boolean;
	readonly multiple: boolean;
	readonly collapsible: boolean;
	// Header holding the roving tabindex — the keyboard-focused item, not the open one.
	readonly focusedId: string | null;
	// Parent-owned roving + navigation, re-registered on each item bond so the item's own header
	// atom can project them under role 'header'.
	keyboardCapabilities(): readonly Capability[];
	// A header took focus (Tab, click) — the highlight follows, so the next arrow key moves from
	// where the user actually is rather than from the last keyboard position.
	notifyFocused(id: string): void;
	open(ids: string[]): void;
	close(ids: string[]): void;
	toggle(id: string): void;
	// Returns a cleanup that unregisters the item.
	attachItem(id: string, item: AccordionItemHandle): () => void;
}

export class AccordionBondBase extends Bond<AccordionBondProps> implements IAccordion {
	// Owns set-algebra + single/multiple mode over the bindable props.values backing.
	#selection: SelectionModel<string> = createSelection<string>({
		get: () => this.props.values,
		set: (v) => (this.props.values = v),
		mode: () => (this.props.multiple ? 'multiple' : 'single')
	});

	// Roving highlight over the enabled headers. Uncontrolled, unlike tabs: an accordion header
	// takes focus without opening its panel (APG accordion has no automatic activation).
	#roving: RovingFocus<AccordionItemHandle> = createRovingFocus<AccordionItemHandle>({
		ids: () => this.#enabledIds,
		item: (id) => this.items.get(id)
	});

	#keyboard: readonly Capability[];

	constructor(props: AccordionBondProps, name = 'accordion') {
		super(props, name);
		// Eagerly create owned collections outside derived reads; collection() registers a capability.
		void this.items;
		// Kept as instances: each item bond re-registers these two so its header atom can project
		// them. Navigation rides role 'header', not the root container — an ArrowDown inside an
		// open panel's textarea must not move the accordion.
		this.#keyboard = [
			rovingCapability(this.#roving),
			navigationCapability(this.#roving, {
				roles: ['header'],
				orientation: 'vertical',
				preventScroll: true,
				onMove: (id) => this.focusHeader(id)
			})
		];
		for (const capability of this.#keyboard) this.capability(capability);
	}

	get #enabledIds(): readonly string[] {
		return this.items.entries.filter(([, item]) => !item.isDisabled).map(([id]) => id);
	}

	// Falls back to the first enabled header so the accordion is always Tab-reachable, including
	// when every panel is closed.
	get focusedId(): string | null {
		return this.#roving.activeId ?? this.#enabledIds[0] ?? null;
	}

	keyboardCapabilities(): readonly Capability[] {
		return this.#keyboard;
	}

	notifyFocused(id: string) {
		this.#roving.goto(id);
	}

	focusHeader(id: string | null) {
		if (id === null) return;
		const header = this.items.get(id)?.elements?.header;
		if (header instanceof HTMLElement) header.focus();
	}

	get selection(): SelectionModel<string> {
		return this.#selection;
	}

	get values(): readonly string[] {
		return this.#selection.values;
	}

	get isDisabled(): boolean {
		return this.props.disabled ?? false;
	}

	get multiple(): boolean {
		return this.props.multiple ?? false;
	}

	get collapsible(): boolean {
		return this.props.collapsible ?? false;
	}

	// Insertion-ordered reactive collection of mounted item bonds.
	get items(): Collection<AccordionItemHandle> {
		return this.collection<AccordionItemHandle>('item');
	}

	// Mounted item bonds for the currently-open values, in values order.
	get activeItems(): readonly (AccordionItemHandle | undefined)[] {
		return this.props.values.map((d) => this.items.get(d));
	}

	open(vals: string[]) {
		this.#selection.select(vals);
	}

	close(vals: string[]) {
		this.#selection.deselect(vals);
	}

	toggle(id: string) {
		this.#selection.toggle(id);
	}

	attachItem(id: string, item: AccordionItemHandle): () => void {
		return this.items.set(id, item);
	}
}

const AccordionRootAtom = defineAtom<AccordionBondBase>('root', {
	slot: '@ixirjs/accordion:root',
	docs: 'Accordion root open, disabled, and selection-mode projection.',
	attrs: (_node, bond) => {
		const props = bond?.props;

		return {
			'aria-disabled': props?.disabled ?? false,
			'aria-multiselectable': props?.multiple ?? false
		};
	}
});

// Selection and item coordination live on the Bond instance.

export const AccordionBond = defineBond({
	name: 'accordion',
	base: AccordionBondBase,
	atoms: { root: AccordionRootAtom }
});

export type AccordionBond = BondOf<typeof AccordionBond>;
