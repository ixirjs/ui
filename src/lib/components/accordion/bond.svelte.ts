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
	// O(1) membership over `values`. OPTIONAL so an existing external implementor of this contract
	// keeps compiling; callers fall back to `values.includes`.
	isValueOpen?(value: string): boolean;
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

	/**
	 * Enabled header ids, MEMOIZED — declared before `#roving` so it is initialized before the
	 * backing that reads it.
	 *
	 * Every item's header atom reads `parent.focusedId`, and `focusedId` reads this. As a plain
	 * getter that was a `filter` + a `map` — two array allocations over every item — run once per
	 * rendered item, i.e. O(n²) allocations per render pass.
	 *
	 * Cold mount of 400 items, quiet box (`node scripts/bench-vs-profile.mjs accordion --scale`):
	 * 3216 ms → 2955 ms with this memo, then 2188 ms once `isValueOpen` below removed the second
	 * O(n) read. `DropdownMenu` never had this because its roving backing points at
	 * `Collection.keys`, which is cached; this is the same fix expressed as a derived, because the
	 * filter depends on each item's `isDisabled` as well as on collection membership.
	 *
	 * The mount is still superlinear afterwards and still ~24× bits-ui's. The residual is the
	 * registration/invalidation cascade, which is architectural — see §6 of
	 * docs/research/perf-vs-shadcn-2026-08.md.
	 */
	#enabledIds: readonly string[] = $derived(
		this.items.entries.filter(([, item]) => !item.isDisabled).map(([id]) => id)
	);

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

	/**
	 * The header holding the roving tabindex. Falls back to the first enabled header so the
	 * accordion is always Tab-reachable, including when every panel is closed.
	 *
	 * `$derived`, and that is the load-bearing part — not a memo for its own sake, but an
	 * **equality gate**. Every item's header atom reads this, and the fallback branch reads
	 * `#enabledIds`, whose array identity changes on every registration. As a plain getter each
	 * header therefore depended on the item collection directly, so mounting item i invalidated all
	 * i−1 headers already mounted: O(n²). As a derived, a registration invalidates this one signal,
	 * it recomputes to the *same string*, and Svelte stops the propagation there.
	 *
	 * Measured with `node scripts/bench-vs-profile.mjs accordion ixir --scale`, which fits `t ∝ n^k`:
	 * k went 1.61 → 0.87 and a cold 400-item mount 2803 ms → 468 ms. `DropdownMenu` never had this
	 * because `RovingFocus.indexOfActive()` returns −1 *before* touching `ids()` when nothing is
	 * highlighted, so its items never take a dependency on the list at all.
	 *
	 * Keep the value primitive. Returning an object or array here reopens the hole — the gate is
	 * Svelte's `===` on the derived's value.
	 */
	readonly focusedId: string | null = $derived(
		this.#roving.activeId ?? this.#firstEnabledId ?? null
	);

	/**
	 * The fallback's target, scanned with an early return instead of read off `#enabledIds[0]`.
	 *
	 * `#enabledIds` builds the whole filtered list, so taking `[0]` from it made every registration
	 * recompute an O(n) filter+map — O(n²) of real work even once the equality gate above stopped
	 * the propagation (k stalled at 1.13). This stops at the first enabled item, which is O(1) in
	 * the ordinary case, and it means `#enabledIds` is **not read at all** during a mount where
	 * nothing is highlighted: `RovingFocus` only reaches `ids()` once an item is actually focused.
	 */
	get #firstEnabledId(): string | undefined {
		for (const [id, item] of this.items.entries) if (!item.isDisabled) return id;
		return undefined;
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

	/**
	 * Open-value membership in O(1).
	 *
	 * Every item's `isOpen`/`isActive` asked `values.includes(id)`, which is O(open) — so an
	 * accordion in `multiple` mode with k panels open cost O(n·k) per render pass, and with all of
	 * them open that is quadratic. Profiled at 7.8% of self time mounting 400 open items (warmed,
	 * `node scripts/bench-vs-profile.mjs accordion ixir 400`); removing it took the cold 400-item
	 * mount from 2955 ms to 2188 ms — a larger share than the `#enabledIds` memo above it.
	 *
	 * Local to this Bond rather than pushed into `SelectionModel.isSelected`, which has the same
	 * O(n) shape for every family: that model's backing is not guaranteed reactive across all ten
	 * of its callers, and a `$derived` over a non-reactive backing caches a stale answer forever.
	 * The accordion's backing is a `$bindable` prop, so here it is sound. See
	 * docs/research/perf-vs-shadcn-2026-08.md §6 for the library-wide version and its risk.
	 */
	#openValues: ReadonlySet<string> = $derived(new Set(this.values));

	isValueOpen(value: string): boolean {
		return this.#openValues.has(value);
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
