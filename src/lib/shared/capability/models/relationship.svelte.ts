import {
	capabilityKey,
	defineRelationshipCapability,
	sharedCapabilityKey,
	type Capability
} from '../capability';
import type { Bond } from '../../bond';
import { DISCLOSURE, type Disclosure } from './disclosure.svelte';

export const TRIGGER_CONTENT = sharedCapabilityKey<void>('@svelte-atoms/cap:trigger-content');
export const TAB_PANEL = sharedCapabilityKey<void>('@svelte-atoms/cap:tab-panel');
export const ERROR_MESSAGE = sharedCapabilityKey<void>('@svelte-atoms/cap:error-message');
export const ROW_COLUMN_CELL = sharedCapabilityKey<void>('@svelte-atoms/cap:row-column-cell');
export const TREE_ITEM_GROUP = sharedCapabilityKey<void>('@svelte-atoms/cap:tree-item-group');
export const ACTIVE_DESCENDANT = sharedCapabilityKey<void>('@svelte-atoms/cap:active-descendant');
export const MENU_SUBMENU = sharedCapabilityKey<void>('@svelte-atoms/cap:menu-submenu');
export const OPTION_COLLECTION = sharedCapabilityKey<void>('@svelte-atoms/cap:option-collection');
export const HEADING_SECTION = sharedCapabilityKey<void>('@svelte-atoms/cap:heading-section');
export const LIVE_REGION = sharedCapabilityKey<void>('@svelte-atoms/cap:live-region');

// Private slot key (not exported from the public barrel): labelledControl is a behavior-only linkage
// nobody retrieves by key, so it stays unforgeable — the private seam.
export const LABELLED = capabilityKey('labelled');

// Reusable a11y linkage between roles. Where atoms must cross-reference each other's ids
// (label/control, trigger/content, tab/tabpanel, …), the wiring resolves siblings via
// `bond.atomByRole(role)`.

export interface TriggerContentOptions {
	// `aria-haspopup` on the trigger (menus, listboxes, dialogs). Omitted by default.
	haspopup?: 'menu' | 'listbox' | 'dialog' | 'grid' | 'tree' | true;
	// ARIA role for the content (e.g. `'region'` for accordion/collapsible).
	contentRole?: string;
}

// Trigger ↔ content disclosure linkage — the most repeated a11y pattern.
// 'trigger' → aria-controls + aria-expanded (+ optional aria-haspopup).
// 'content' → aria-labelledby (+ optional role). Slot 'trigger-content'.
export function triggerContentLink(
	disclosure: Disclosure,
	options: TriggerContentOptions = {}
): Capability<void> {
	return defineRelationshipCapability<void>({
		slot: TRIGGER_CONTENT,
		requires: [DISCLOSURE],
		meta: {
			projects: ['trigger', 'content'],
			requiresRoles: ['trigger', 'content'],
			docs: 'ARIA linkage between a disclosure trigger and its controlled content.'
		},
		roles: {
			trigger: () => ({
				attrs: (bond) => ({
					'aria-controls': bond.atomByRole('content')?.id,
					'aria-expanded': disclosure.isOpen,
					...(options.haspopup ? { 'aria-haspopup': options.haspopup } : {})
				})
			}),
			content: () => ({
				attrs: (bond) => ({
					'aria-labelledby': bond.atomByRole('trigger')?.id,
					...(options.contentRole ? { role: options.contentRole } : {})
				})
			})
		}
	});
}

// Options for `labelledControl`.
export interface LabelledControlOptions {
	// Also emit a native `for` attr for real <label>/<input> pairs (default: aria-labelledby only).
	nativeFor?: boolean;
}

// Label/description → control linkage for the form-field pattern. Projects onto 'control'
// the ARIA references to its label and description siblings; each reference is omitted when
// the sibling is absent. Slot 'labelled'.
export function labelledControl(options: LabelledControlOptions = {}): Capability<void> {
	return defineRelationshipCapability<void>({
		slot: LABELLED,
		meta: {
			projects: options.nativeFor
				? ['control', 'label', 'description']
				: ['control', 'description'],
			requiresRoles: ['control', 'label'],
			docs: 'ARIA and optional native linkage between labels, descriptions, and controls.'
		},
		roles: {
			control: () => ({
				attrs: (bond) => {
					const label = bond.atomByRole('label')?.id;
					const description = bond.atomByRole('description')?.id;
					return {
						...(label ? { 'aria-labelledby': label } : {}),
						...(description ? { 'aria-describedby': description } : {})
					};
				}
			}),
			// nativeFor emits the real `for` attr only when opted in; otherwise the label projects nothing.
			label: () =>
				options.nativeFor
					? { attrs: (bond) => ({ for: bond.atomByRole('control')?.id }) }
					: undefined,
			description: () => ({})
		}
	});
}

export interface TabPanelLinkOptions {
	// Predicate for active tab/panel state. Defaults to active so a bare relationship emits refs.
	selected?: (bond: Bond) => boolean;
}

export function tabPanelLink(options: TabPanelLinkOptions = {}): Capability<void> {
	const selected = (bond: Bond) => options.selected?.(bond) ?? true;
	return defineRelationshipCapability<void>({
		slot: TAB_PANEL,
		meta: {
			projects: ['tab', 'tabpanel'],
			requiresRoles: ['tab', 'tabpanel'],
			docs: 'ARIA linkage between a tab and its controlled tabpanel.'
		},
		roles: {
			tab: () => ({
				attrs: (bond) => ({
					role: 'tab',
					'aria-controls': bond.atomByRole('tabpanel')?.id,
					'aria-selected': selected(bond)
				})
			}),
			tabpanel: () => ({
				attrs: (bond) => {
					const isSelected = selected(bond);
					return {
						role: 'tabpanel',
						'aria-labelledby': bond.atomByRole('tab')?.id,
						hidden: isSelected ? undefined : true,
						tabindex: isSelected ? 0 : -1
					};
				}
			})
		}
	});
}

export interface ErrorMessageLinkOptions {
	// Predicate for invalid state. Defaults to invalid when an error message atom exists.
	invalid?: (bond: Bond) => boolean;
	// Promote the error message to an assertive live announcement.
	live?: boolean;
}

export function errorMessageLink(options: ErrorMessageLinkOptions = {}): Capability<void> {
	const invalid = (bond: Bond) => options.invalid?.(bond) ?? Boolean(bond.atomByRole('error'));
	return defineRelationshipCapability<void>({
		slot: ERROR_MESSAGE,
		meta: {
			projects: ['control', 'error'],
			requiresRoles: ['control', 'error'],
			docs: 'ARIA linkage between a control and its validation error message.'
		},
		roles: {
			control: () => ({
				attrs: (bond) => {
					if (!invalid(bond)) return {};
					const error = bond.atomByRole('error')?.id;
					return {
						...(error ? { 'aria-errormessage': error, 'aria-invalid': 'true' } : {})
					};
				}
			}),
			error: () => ({
				attrs: () => (options.live ? { role: 'alert' } : {})
			})
		}
	});
}

export type GridCellContext =
	| string
	| {
			headers?: string | readonly string[];
	  };

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

export function rowColumnCellLink(options: RowColumnCellLinkOptions = {}): Capability<void> {
	return defineRelationshipCapability<void>({
		slot: ROW_COLUMN_CELL,
		meta: {
			projects: ['row', 'column', 'cell'],
			requiresRoles: ['row', 'column', 'cell'],
			docs: 'ARIA relationship primitives for grid rows, column headers, and cells.'
		},
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
						joinIds([bond.atomByRole('row')?.id, bond.atomByRole('column')?.id]);
					return {
						role: 'gridcell',
						...(headers ? { headers } : {})
					};
				}
			})
		}
	});
}

export function treeItemGroupLink(disclosure: Disclosure): Capability<void> {
	return defineRelationshipCapability<void>({
		slot: TREE_ITEM_GROUP,
		requires: [DISCLOSURE],
		meta: {
			projects: ['treeitem', 'treegroup'],
			requiresRoles: ['treeitem', 'treegroup'],
			docs: 'ARIA linkage between an expandable tree item and its child group.'
		},
		roles: {
			treeitem: () => ({
				attrs: (bond) => ({
					role: 'treeitem',
					'aria-controls': bond.atomByRole('treegroup')?.id,
					'aria-expanded': disclosure.isOpen
				})
			}),
			treegroup: () => ({
				attrs: (bond) => ({
					role: 'group',
					'aria-labelledby': bond.atomByRole('treeitem')?.id
				})
			})
		}
	});
}

export interface ActiveDescendantLinkOptions {
	targetRoles?: readonly string[];
	itemRole?: string;
	activeId?: (bond: Bond) => string | null | undefined;
}

export function activeDescendantLink(options: ActiveDescendantLinkOptions = {}): Capability<void> {
	const targetRoles = options.targetRoles ?? ['control', 'container'];
	const itemRole = options.itemRole ?? 'item';
	const projects = [...targetRoles, itemRole];

	return defineRelationshipCapability<void>({
		slot: ACTIVE_DESCENDANT,
		meta: {
			projects,
			requiresRoles: projects,
			docs: 'ARIA linkage from a control or container to its active descendant item.'
		},
		behavior: (role) => {
			if (targetRoles.includes(role)) {
				return {
					attrs: (bond) => ({
						'aria-activedescendant': options.activeId?.(bond) ?? bond.atomByRole(itemRole)?.id
					})
				};
			}
			return role === itemRole ? {} : undefined;
		}
	});
}

export interface MenuSubmenuRelationshipOptions {
	expanded?: (bond: Bond) => boolean | undefined;
	haspopup?: 'menu' | 'listbox' | 'dialog' | 'grid' | 'tree' | true;
	submenuRole?: string;
}

export function menuSubmenuRelationship(
	options: MenuSubmenuRelationshipOptions = {}
): Capability<void> {
	const haspopup = options.haspopup ?? 'menu';
	const submenuRole = options.submenuRole ?? 'menu';

	return defineRelationshipCapability<void>({
		slot: MENU_SUBMENU,
		meta: {
			projects: ['menuitem', 'submenu'],
			requiresRoles: ['menuitem', 'submenu'],
			docs: 'ARIA linkage between a menu item and its controlled submenu.'
		},
		roles: {
			menuitem: () => ({
				attrs: (bond) => ({
					role: 'menuitem',
					'aria-controls': bond.atomByRole('submenu')?.id,
					'aria-haspopup': haspopup,
					'aria-expanded': options.expanded?.(bond)
				})
			}),
			submenu: () => ({
				attrs: (bond) => ({
					role: submenuRole,
					'aria-labelledby': bond.atomByRole('menuitem')?.id
				})
			})
		}
	});
}

export interface OptionCollectionRelationshipOptions {
	collectionRole?: 'listbox' | 'menu' | 'radiogroup' | string;
	optionRole?: 'option' | 'menuitem' | 'menuitemradio' | 'radio' | string;
	optionIds?: (bond: Bond) => string | readonly string[] | undefined;
}

export function optionCollectionRelationship(
	options: OptionCollectionRelationshipOptions = {}
): Capability<void> {
	const collectionRole = options.collectionRole ?? 'listbox';
	const optionRole = options.optionRole ?? 'option';

	return defineRelationshipCapability<void>({
		slot: OPTION_COLLECTION,
		meta: {
			projects: ['collection', 'option'],
			requiresRoles: ['collection', 'option'],
			docs: 'ARIA role and ownership linkage between an option and its collection.'
		},
		roles: {
			collection: () => ({
				attrs: (bond) => {
					const optionIds =
						normalizeHeaders(options.optionIds?.(bond)) ?? bond.atomByRole('option')?.id;
					return {
						role: collectionRole,
						...(optionIds ? { 'aria-owns': optionIds } : {})
					};
				}
			}),
			option: () => ({
				attrs: () => ({ role: optionRole })
			})
		}
	});
}

export interface HeadingSectionRelationshipOptions {
	targetRoles?: readonly string[];
	headingRole?: string;
	descriptionRole?: string;
	targetRole?: string;
}

export function headingSectionRelationship(
	options: HeadingSectionRelationshipOptions = {}
): Capability<void> {
	const targetRoles = options.targetRoles ?? ['section', 'surface'];
	const headingRole = options.headingRole ?? 'heading';
	const descriptionRole = options.descriptionRole ?? 'description';
	const projects = [...targetRoles, headingRole, descriptionRole];

	return defineRelationshipCapability<void>({
		slot: HEADING_SECTION,
		meta: {
			projects,
			requiresRoles: [headingRole, ...targetRoles],
			docs: 'ARIA linkage where a heading and description label a section or surface.'
		},
		behavior: (role) => {
			if (targetRoles.includes(role)) {
				return {
					attrs: (bond) => ({
						...(options.targetRole ? { role: options.targetRole } : {}),
						'aria-labelledby': bond.atomByRole(headingRole)?.id,
						'aria-describedby': bond.atomByRole(descriptionRole)?.id
					})
				};
			}
			return role === headingRole || role === descriptionRole ? {} : undefined;
		}
	});
}

export interface LiveRegionRelationshipOptions {
	liveRole?: string;
	politeness?: 'off' | 'polite' | 'assertive';
	atomic?: boolean;
	relevant?: string;
}

export function liveRegionRelationship(
	options: LiveRegionRelationshipOptions = {}
): Capability<void> {
	const liveRole = options.liveRole ?? 'status';
	const politeness = options.politeness ?? 'polite';
	const atomic = options.atomic ?? true;

	return defineRelationshipCapability<void>({
		slot: LIVE_REGION,
		meta: {
			projects: ['live', 'title', 'description', 'content'],
			requiresRoles: ['live', 'content'],
			docs: 'ARIA live-region relationship for announced title, description, and content.'
		},
		roles: {
			live: () => ({
				attrs: (bond) => ({
					role: liveRole,
					'aria-live': politeness,
					'aria-atomic': atomic ? 'true' : 'false',
					'aria-relevant': options.relevant,
					'aria-labelledby': bond.atomByRole('title')?.id,
					'aria-describedby': bond.atomByRole('description')?.id
				})
			}),
			title: () => ({}),
			description: () => ({}),
			content: () => ({})
		}
	});
}

export const rowColumnRelationship = rowColumnCellLink;
export const treeGroupRelationship = treeItemGroupLink;
