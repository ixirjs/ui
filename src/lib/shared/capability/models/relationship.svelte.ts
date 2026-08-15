import {
	capabilityKey,
	defineCapability,
	sharedCapabilityKey,
	type Capability,
	type CapabilityConfig,
	type CapabilityKey
} from '$ixirjs/ui/shared/capability/capability';
import { internCapabilityFactory } from '$ixirjs/ui/shared/capability/intern';
import type { Bond } from '$ixirjs/ui/shared/bond';
import { DISCLOSURE } from './disclosure.svelte';

export const TRIGGER_CONTENT = sharedCapabilityKey<void>('@ixirjs/cap:trigger-content');
export const TAB_PANEL = sharedCapabilityKey<void>('@ixirjs/cap:tab-panel');
export const ERROR_MESSAGE = sharedCapabilityKey<void>('@ixirjs/cap:error-message');
export const ROW_COLUMN_CELL = sharedCapabilityKey<void>('@ixirjs/cap:row-column-cell');
export const TREE_ITEM_GROUP = sharedCapabilityKey<void>('@ixirjs/cap:tree-item-group');
export const LIVE_REGION = sharedCapabilityKey<void>('@ixirjs/cap:live-region');

// Private slot key (not exported from the public barrel): labelledControl is a behavior-only linkage
// nobody retrieves by key, so it stays unforgeable — the private seam.
const LABELLED = capabilityKey<void>('labelled');

// Reusable a11y linkage between roles. Where atoms must cross-reference each other's ids
// (label/control, trigger/content, tab/tabpanel, …), the wiring resolves siblings via
// `bond.nodeByRole(role)`.

/**
 * Every relationship below is the same descriptor with a different role map: a fixed slot, a
 * `void` surface (a linkage holds no state — that is why they intern), a docs line, the roles it
 * projects, and an options bag defaulting to `{}`. Only the projection itself differs, so that is
 * all a declaration states.
 *
 * `projects` comes back from `build` rather than sitting beside `docs` so a relationship can derive
 * its role list from its options. Every surviving relationship returns a literal list, so this seam
 * is currently unused flexibility — collapse it if none grows one back.
 *
 * This is *not* `defineRoleProjection`: that helper's `attrs(ctx, role)` never receives the Bond,
 * and every relationship here resolves a sibling through `bond.nodeByRole(...)`.
 */
type RelationshipProjection = Pick<CapabilityConfig<void>, 'roles' | 'behavior' | 'requires'> & {
	projects: readonly string[];
};

function defineRelationship<O extends object>(
	slot: CapabilityKey<void>,
	docs: string,
	build: (options: O) => RelationshipProjection
): (options?: O) => Capability<void> {
	return internCapabilityFactory((options: O = {} as O): Capability<void> => {
		const { projects, ...projection } = build(options);
		return defineCapability<void>({ slot, meta: { projects, docs }, ...projection });
	});
}

export interface TriggerContentOptions {
	// `aria-haspopup` on the trigger (menus, listboxes, dialogs). Omitted by default.
	haspopup?: 'menu' | 'listbox' | 'dialog' | 'grid' | 'tree' | true;
	// ARIA role for the content (e.g. `'region'` for accordion/collapsible).
	contentRole?: string;
}

// Trigger ↔ content disclosure linkage — the most repeated a11y pattern.
// 'trigger' → aria-controls + aria-expanded (+ optional aria-haspopup).
// 'content' → aria-labelledby (+ optional role). Slot 'trigger-content'.
export const triggerContentLink = defineRelationship<TriggerContentOptions>(
	TRIGGER_CONTENT,
	'ARIA linkage between a disclosure trigger and its controlled content.',
	(options) => ({
		projects: ['trigger', 'content'],
		requires: [DISCLOSURE],
		roles: {
			trigger: () => ({
				attrs: (bond) => {
					const disclosure = bond.requireSurface(DISCLOSURE);
					return {
						'aria-controls': bond.nodeByRole('content')?.id,
						'aria-expanded': disclosure.isOpen,
						'data-state': disclosure.isOpen ? 'open' : 'closed',
						...(options.haspopup ? { 'aria-haspopup': options.haspopup } : {})
					};
				}
			}),
			content: () => ({
				attrs: (bond) => ({
					'aria-labelledby': bond.nodeByRole('trigger')?.id,
					// The CSS-animation hook: presets style the open/closed transition, but a consumer
					// bypassing the preset has no other handle on disclosure state.
					'data-state': bond.requireSurface(DISCLOSURE).isOpen ? 'open' : 'closed',
					...(options.contentRole ? { role: options.contentRole } : {})
				})
			})
		}
	})
);

// Options for `labelledControl`.
export interface LabelledControlOptions {
	// Also emit a native `for` attr for real <label>/<input> pairs (default: aria-labelledby only).
	nativeFor?: boolean;
}

// Label/description → control linkage for the form-field pattern. Projects onto 'control'
// the ARIA references to its label and description siblings; each reference is omitted when
// the sibling is absent. Slot 'labelled'.
export const labelledControl = defineRelationship<LabelledControlOptions>(
	LABELLED,
	'ARIA and optional native linkage between labels, descriptions, and controls.',
	(options) => ({
		projects: ['control', 'label', 'description'],
		roles: {
			control: () => ({
				attrs: (bond) => {
					const label = bond.nodeByRole('label')?.id;
					const description = bond.nodeByRole('description')?.id;
					// Built conditionally: the absent-sibling case (every SSR root whose label renders
					// after it) merges as an empty layer, which `mergeAttributeLayer` returns unchanged.
					const attrs: Record<string, unknown> = {};
					if (label) attrs['aria-labelledby'] = label;
					if (description) attrs['aria-describedby'] = description;
					return attrs;
				}
			}),
			// nativeFor emits the real `for` attr only when opted in; otherwise the label role is a no-op.
			label: () =>
				options.nativeFor ? { attrs: (bond) => ({ for: bond.nodeByRole('control')?.id }) } : {},
			description: () => ({})
		}
	})
);

export interface TabPanelLinkOptions {
	// Predicate for active tab/panel state. Defaults to active so a bare relationship emits refs.
	selected?: (bond: Bond) => boolean;
}

export const tabPanelLink = defineRelationship<TabPanelLinkOptions>(
	TAB_PANEL,
	'ARIA linkage between a tab and its controlled tabpanel.',
	(options) => {
		const selected = (bond: Bond) => options.selected?.(bond) ?? true;
		return {
			projects: ['tab', 'tabpanel'],
			roles: {
				tab: () => ({
					attrs: (bond) => ({
						role: 'tab',
						'aria-controls': bond.nodeByRole('tabpanel')?.id,
						'aria-selected': selected(bond)
					})
				}),
				tabpanel: () => ({
					attrs: (bond) => {
						const isSelected = selected(bond);
						return {
							role: 'tabpanel',
							'aria-labelledby': bond.nodeByRole('tab')?.id,
							hidden: isSelected ? undefined : true,
							tabindex: isSelected ? 0 : -1
						};
					}
				})
			}
		};
	}
);

export interface ErrorMessageLinkOptions {
	// Predicate for invalid state. Defaults to invalid when an error message atom exists.
	invalid?: (bond: Bond) => boolean;
	// Promote the error message to an assertive live announcement.
	live?: boolean;
}

export const errorMessageLink = defineRelationship<ErrorMessageLinkOptions>(
	ERROR_MESSAGE,
	'ARIA linkage between a control and its validation error message.',
	(options) => {
		const invalid = (bond: Bond) => options.invalid?.(bond) ?? Boolean(bond.nodeByRole('error'));
		return {
			projects: ['control', 'error'],
			roles: {
				control: () => ({
					attrs: (bond) => {
						if (!invalid(bond)) return {};
						const error = bond.nodeByRole('error')?.id;
						return {
							...(error ? { 'aria-errormessage': error, 'aria-invalid': 'true' } : {})
						};
					}
				}),
				error: () => ({
					attrs: () => (options.live ? { role: 'alert' } : {})
				})
			}
		};
	}
);

export interface RowColumnCellLinkOptions {
	// Override cell header ids when row/column atoms live in sibling child bonds.
	headers?: (bond: Bond, ctx: unknown) => string | readonly string[] | undefined;
}

function joinIds(ids: readonly (string | undefined)[]): string | undefined {
	const joined = ids.filter((id): id is string => Boolean(id)).join(' ');
	return joined || undefined;
}

function normalizeHeaders(headers: string | readonly string[] | undefined): string | undefined {
	if (typeof headers === 'string' || headers === undefined) return headers;
	return joinIds(headers);
}

export const rowColumnCellLink = defineRelationship<RowColumnCellLinkOptions>(
	ROW_COLUMN_CELL,
	'ARIA relationship primitives for grid rows, column headers, and cells.',
	(options) => ({
		projects: ['row', 'column', 'cell'],
		roles: {
			row: () => ({ attrs: () => ({ role: 'row' }) }),
			column: () => ({ attrs: () => ({ role: 'columnheader' }) }),
			cell: (ctx) => ({
				attrs: (bond) => {
					const explicit =
						options.headers?.(bond, ctx) ??
						(typeof ctx === 'object' && ctx !== null && 'headers' in ctx
							? (ctx as { headers?: string | readonly string[] }).headers
							: typeof ctx === 'string'
								? ctx
								: undefined);
					const headers =
						normalizeHeaders(explicit) ??
						joinIds([bond.nodeByRole('row')?.id, bond.nodeByRole('column')?.id]);
					return {
						role: 'gridcell',
						...(headers ? { 'aria-labelledby': headers } : {})
					};
				}
			})
		}
	})
);

export const treeItemGroupLink = defineRelationship(
	TREE_ITEM_GROUP,
	'ARIA linkage between an expandable tree item and its child group.',
	() => ({
		projects: ['treeitem', 'treegroup'],
		requires: [DISCLOSURE],
		roles: {
			treeitem: () => ({
				attrs: (bond) => ({
					role: 'treeitem',
					'aria-controls': bond.nodeByRole('treegroup')?.id,
					'aria-expanded': bond.requireSurface(DISCLOSURE).isOpen
				})
			}),
			treegroup: () => ({
				attrs: (bond) => ({
					role: 'group',
					'aria-labelledby': bond.nodeByRole('treeitem')?.id
				})
			})
		}
	})
);

// `aria-activedescendant` comes from `rovingCapability` (container role) and `inputCapability`
// (input role), both of which know which descendant is actually active.

// An option collection's ARIA comes from the capabilities that own the state behind it:
// `aria-multiselectable` from `selectionCapability`, `aria-setsize`/`aria-posinset` from
// `collectionCapability`, and the roles from each atom's own role projection.

// A heading labelling a section is `labelledControl` with different role names — use that.

export interface LiveRegionRelationshipOptions {
	// Projected role name to attach to — a surface that is already a 'control' for `labelledControl`
	// announces from that same atom rather than declaring a second one.
	role?: string;
	// ARIA role *value* ('status', 'alert', …).
	liveRole?: string;
	// Each announcement attr is emitted only when asked for, so a surface whose implicit role
	// semantics already carry it (role="alert" implies assertive/atomic) stays free of the duplicate.
	politeness?: 'off' | 'polite' | 'assertive';
	atomic?: boolean;
	relevant?: string;
}

// Announcement attrs only. Labelling a live region is `labelledControl`'s job — projecting
// aria-labelledby from here too would put two capabilities on the same attribute.
export const liveRegionRelationship = defineRelationship<LiveRegionRelationshipOptions>(
	LIVE_REGION,
	'ARIA live-region announcement attrs for a status or alert surface.',
	(options) => {
		const role = options.role ?? 'live';
		const liveRole = options.liveRole ?? 'status';

		return {
			projects: [role],
			behavior: (projected) =>
				projected === role
					? {
							attrs: () => ({
								role: liveRole,
								'aria-live': options.politeness,
								'aria-atomic':
									options.atomic === undefined ? undefined : options.atomic ? 'true' : 'false',
								'aria-relevant': options.relevant
							})
						}
					: undefined
		};
	}
);
