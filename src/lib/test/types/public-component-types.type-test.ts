import type { Component, Snippet } from 'svelte';
import type {
	AccordionItemRootProps,
	ButtonProps,
	CollapsibleChildren,
	CollapsibleRootProps,
	DatagridColumnChildren,
	DatagridRootProps,
	DropdownMenuItemProps as RootDropdownMenuItemProps,
	FieldChildren as RootFieldChildren,
	FormRootProps as RootFormRootProps,
	InputControlProps,
	InputStateChangeCallback,
	PortalSurfaceProps as RootPortalSurfaceProps,
	PortalTarget as RootPortalTarget,
	SelectItemProps as RootSelectItemProps,
	SortBy,
	StateChangeCallback,
	StateChangeContext
} from '@ixirjs/ui';
import type { HtmlAtomProps } from '@ixirjs/ui/components/atom';
import {
	Combobox,
	type ComboboxItemProps,
	type ComboboxTriggerProps
} from '@ixirjs/ui/components/combobox';
import type { ContainerChildren, ContainerProps } from '@ixirjs/ui/components/container';
import type {
	ContextMenuContentProps,
	ContextMenuDividerProps,
	ContextMenuGroupProps,
	ContextMenuIndicatorProps,
	ContextMenuItemProps,
	ContextMenuRootProps,
	ContextMenuTailProps,
	ContextMenuTitleProps,
	ContextMenuTriggerProps
} from '@ixirjs/ui/components/context-menu';
import type { DropdownMenuItemProps } from '@ixirjs/ui/components/dropdown-menu';
import type { FormRootProps } from '@ixirjs/ui/components/form';
import type {
	FieldChildren,
	FieldControlChangeDetails,
	FieldControlProps,
	FieldHelperTextProps,
	FieldLabelProps,
	FieldRootProps,
	FieldSnippetProps,
	FieldTextProps
} from '@ixirjs/ui/components/form/field';
import type { LazyProps } from '@ixirjs/ui/components/lazy';
import {
	List,
	type ListDividerProps,
	type ListGroupProps,
	type ListItemProps,
	type ListRootProps,
	type ListTitleProps
} from '@ixirjs/ui/components/list';
import type {
	PortalOuterProps,
	PortalSurfaceProps,
	PortalTarget,
	TeleportProps
} from '@ixirjs/ui/components/portal';
import type { RootPortals } from '@ixirjs/ui/components/root';
import type {
	SelectItemProps,
	SelectSelection,
	SelectSelectionHandle
} from '@ixirjs/ui/components/select';

type Equal<Left, Right> =
	(<Value>() => Value extends Left ? 1 : 2) extends <Value>() => Value extends Right ? 1 : 2
		? (<Value>() => Value extends Right ? 1 : 2) extends <Value>() => Value extends Left ? 1 : 2
			? true
			: false
		: false;
type Assert<Condition extends true> = Condition;

export type RootCallbackTypesArePublic = Assert<
	Equal<
		Parameters<StateChangeCallback<string, { id: string }>>[1],
		StateChangeContext<{ id: string }>
	>
>;

export type RootApplicationTypesArePublic = [
	ButtonProps,
	CollapsibleRootProps,
	CollapsibleChildren,
	InputControlProps,
	InputStateChangeCallback<string>,
	RootFormRootProps,
	RootFieldChildren,
	DatagridRootProps,
	DatagridColumnChildren,
	SortBy,
	RootPortalTarget,
	RootPortalSurfaceProps,
	AccordionItemRootProps,
	RootDropdownMenuItemProps,
	RootSelectItemProps
];

export type RootAndFormFacadeExportCanonicalRootProps = Assert<
	Equal<RootFormRootProps, FormRootProps>
>;

export type RootAndPortalFacadeExportCanonicalTarget = Assert<
	Equal<RootPortalTarget, PortalTarget>
>;

export type RootAndNestedFacadeExportCanonicalItemProps = Assert<
	Equal<RootDropdownMenuItemProps, DropdownMenuItemProps>
>;

export type FieldFacadeExportsPublicProps = [
	FieldSnippetProps,
	FieldChildren,
	FieldRootProps,
	FieldLabelProps,
	FieldControlChangeDetails,
	FieldControlProps,
	FieldHelperTextProps,
	FieldTextProps
];

export type ContextMenuExportsEveryRenderedPartProps = [
	ContextMenuRootProps,
	ContextMenuTriggerProps,
	ContextMenuContentProps,
	ContextMenuTailProps,
	ContextMenuDividerProps,
	ContextMenuGroupProps,
	ContextMenuIndicatorProps,
	ContextMenuItemProps,
	ContextMenuTitleProps
];

export type ListExportsEveryRenderedPartProps = [
	ListRootProps,
	ListGroupProps,
	ListItemProps,
	ListTitleProps,
	ListDividerProps
];

export type ContainerUsesDivHtmlAtomProps = Assert<
	ContainerProps extends HtmlAtomProps<'div', never, ContainerChildren> ? true : false
>;

type Option = { label: string };

const renderlessFormProps = {
	renderless: true,
	validator: {}
} satisfies FormRootProps;

// @ts-expect-error Renderless forms do not render an element or accept element props.
const invalidRenderlessFormProps: FormRootProps = {
	renderless: true,
	class: 'not-rendered'
};

const fieldRootProps = {
	validator: {
		validate(_schema: unknown, value: unknown) {
			return { success: true as const, data: value, errors: [] };
		}
	}
} satisfies FieldRootProps;

const listGroupProps = {} satisfies ListGroupProps;

const comboboxItemProps = {
	value: 'option-1',
	data: { label: 'Option 1' }
} satisfies ComboboxItemProps<Option>;

const comboboxTriggerProps = {
	as: 'button'
} satisfies ComboboxTriggerProps<'button'>;

const dropdownMenuItemProps = {
	disabled: true
} satisfies DropdownMenuItemProps;

const selectItemProps = {
	value: 'option-1',
	data: { label: 'Option 1' }
} satisfies SelectItemProps<Option>;

const selectionHandle: SelectSelectionHandle = {
	id: 'item-1',
	value: 'option-1',
	label: 'Option 1',
	createdAt: new Date(),
	unselect() {}
};

const selection = {
	id: selectionHandle.id,
	value: selectionHandle.value,
	label: selectionHandle.label,
	createdAt: selectionHandle.createdAt,
	unselect: () => selectionHandle.unselect(),
	controller: selectionHandle
} satisfies SelectSelection;

const rootPortal: RootPortals = 'root.l0';
const portalTarget: PortalTarget = rootPortal;
const portalOuterProps = { id: rootPortal } satisfies PortalOuterProps;
const teleportProps = { portal: rootPortal } satisfies TeleportProps;
const portalSurfaceProps = { portal: rootPortal } satisfies PortalSurfaceProps;

interface LoadedProps {
	message: string;
	children?: Snippet;
}

declare const loadedComponent: Component<LoadedProps>;
const lazyProps = {
	promise: Promise.resolve(loadedComponent),
	message: 'Forwarded to the loaded component'
} satisfies LazyProps<LoadedProps>;

void [
	List,
	Combobox,
	renderlessFormProps,
	invalidRenderlessFormProps,
	fieldRootProps,
	listGroupProps,
	comboboxItemProps,
	comboboxTriggerProps,
	dropdownMenuItemProps,
	selectItemProps,
	selection,
	portalTarget,
	portalOuterProps,
	teleportProps,
	portalSurfaceProps,
	lazyProps
];
