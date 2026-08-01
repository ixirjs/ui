import {
	defineArchetypeCapabilities,
	type ArchetypeCapabilities,
	type Capability
} from '../capability';
import {
	collectionCapability,
	type CollectionCapability,
	type CollectionProjectionOptions
} from './collection.svelte';
import {
	selectableCollectionCapability,
	navigableCollectionCapability,
	filterableCollectionCapability,
	labelledFieldCapability,
	validatedControlCapability,
	type LabelledFieldCapabilityOptions,
	type ValidatedControlCapabilityOptions
} from './focused.svelte';
import { type SelectionModel, type SelectionProjectionOptions } from './selection.svelte';
import { type RovingFocus, type RovingProjectionOptions } from './roving.svelte';
import { type NavigationProjectionOptions } from './navigation.svelte';
import { type InputModel, type InputProjectionOptions } from './input.svelte';
import { typeaheadCapability, type TypeaheadOptions } from './typeahead.svelte';
import {
	rowColumnCellLink,
	tabPanelLink,
	treeItemGroupLink,
	triggerContentLink,
	labelledControl,
	type RowColumnCellLinkOptions,
	type TabPanelLinkOptions,
	type TriggerContentOptions,
	type LabelledControlOptions
} from './relationship.svelte';
import {
	disclosureCapability,
	disclosureClose,
	disclosureTrigger,
	type Disclosure,
	type DisclosureActivationOptions
} from './disclosure.svelte';
import { statusCapability, type StatusModel, type StatusProjectionOptions } from './status.svelte';

interface CollectionRecipe<T> {
	kind?: string;
	collection?: CollectionCapability<T>;
	collectionOptions?: CollectionProjectionOptions | undefined;
}

export interface ListboxCapabilitiesOptions<T = unknown> extends CollectionRecipe<T> {
	selection: SelectionModel<T>;
	roving: RovingFocus<T>;
	input?: InputModel;
	selectionOptions?: SelectionProjectionOptions | undefined;
	rovingOptions?: RovingProjectionOptions | undefined;
	navigation?: NavigationProjectionOptions | undefined;
	inputOptions?: InputProjectionOptions | undefined;
	typeahead?: TypeaheadOptions<T> | undefined;
}

export interface MenuCapabilitiesOptions<T = unknown> extends CollectionRecipe<T> {
	roving: RovingFocus<T>;
	rovingOptions?: RovingProjectionOptions | undefined;
	navigation?: NavigationProjectionOptions | undefined;
	typeahead?: TypeaheadOptions<T> | undefined;
}

export interface TabsCapabilitiesOptions<T = unknown> extends CollectionRecipe<T> {
	selection: SelectionModel<T>;
	selectionOptions?: SelectionProjectionOptions | undefined;
	tabPanel?: TabPanelLinkOptions | undefined;
}

export interface TreeCapabilitiesOptions<T = unknown> extends CollectionRecipe<T> {
	selection: SelectionModel<T>;
	roving: RovingFocus<T>;
	disclosure?: Disclosure;
	selectionOptions?: SelectionProjectionOptions | undefined;
	rovingOptions?: RovingProjectionOptions | undefined;
	navigation?: NavigationProjectionOptions | undefined;
}

export interface GridCapabilitiesOptions<T = unknown> extends CollectionRecipe<T> {
	selection?: SelectionModel<T>;
	roving?: RovingFocus<T>;
	selectionOptions?: SelectionProjectionOptions | undefined;
	rovingOptions?: RovingProjectionOptions | undefined;
	navigation?: NavigationProjectionOptions | undefined;
	rowColumnCell?: RowColumnCellLinkOptions | undefined;
}

export interface ToastCapabilitiesOptions {
	disclosure: Disclosure;
	labelled?: LabelledControlOptions | undefined;
	close?: DisclosureActivationOptions | false | undefined;
	status?: StatusModel | undefined;
	statusOptions?: StatusProjectionOptions | undefined;
}

export interface FieldCapabilitiesOptions<T = unknown>
	extends
		Omit<LabelledFieldCapabilityOptions, 'status'>,
		Omit<ValidatedControlCapabilityOptions<T>, 'status'> {
	status?: StatusModel | undefined;
	statusOptions?: StatusProjectionOptions | undefined;
}

export interface DatePickerCapabilitiesOptions<T = unknown> {
	disclosure: Disclosure;
	triggerContent?: TriggerContentOptions | undefined;
	trigger?: DisclosureActivationOptions | false | undefined;
	close?: DisclosureActivationOptions | false | undefined;
	status?: StatusModel | undefined;
	statusOptions?: StatusProjectionOptions | undefined;
	grid?: GridCapabilitiesOptions<T> | undefined;
}

export function listboxCapabilities<T = unknown>(
	options: ListboxCapabilitiesOptions<T>
): ArchetypeCapabilities {
	const collection = resolveCollection(options);
	const capabilities: Capability[] = [
		...selectableCollectionCapability({
			collection,
			selection: options.selection,
			selectionOptions: options.selectionOptions
		}),
		...navigableCollectionCapability({
			collection,
			roving: options.roving,
			rovingOptions: options.rovingOptions,
			navigation: options.navigation
		})
	];
	if (options.input) {
		capabilities.push(
			...filterableCollectionCapability({
				collection,
				input: options.input,
				roving: options.roving,
				inputOptions: options.inputOptions,
				typeahead: options.typeahead
			})
		);
	}
	return defineArchetypeCapabilities(capabilities, {
		docs: 'Layer 3 recipe for selectable, navigable, optionally filterable listbox behavior.'
	});
}

export function menuCapabilities<T = unknown>(
	options: MenuCapabilitiesOptions<T>
): ArchetypeCapabilities {
	const collection = resolveCollection(options);
	return defineArchetypeCapabilities(
		[
			...navigableCollectionCapability({
				collection,
				roving: options.roving,
				rovingOptions: options.rovingOptions,
				navigation: options.navigation
			}),
			typeaheadCapability(collection.surface, options.roving, options.typeahead)
		],
		{
			docs: 'Layer 3 recipe for navigable menu behavior with typeahead.'
		}
	);
}

export function tabsCapabilities<T = unknown>(
	options: TabsCapabilitiesOptions<T>
): ArchetypeCapabilities {
	const collection = resolveCollection(options);
	return defineArchetypeCapabilities(
		[
			...selectableCollectionCapability({
				collection,
				selection: options.selection,
				selectionOptions: { commit: 'select', ...options.selectionOptions }
			}),
			tabPanelLink(options.tabPanel)
		],
		{
			docs: 'Layer 3 recipe for tabs selection and tab-panel relationship wiring.'
		}
	);
}

export function treeCapabilities<T = unknown>(
	options: TreeCapabilitiesOptions<T>
): ArchetypeCapabilities {
	const collection = resolveCollection(options);
	const capabilities: Capability[] = [
		...selectableCollectionCapability({
			collection,
			selection: options.selection,
			selectionOptions: options.selectionOptions
		}),
		...navigableCollectionCapability({
			collection,
			roving: options.roving,
			rovingOptions: options.rovingOptions,
			navigation: options.navigation
		})
	];
	if (options.disclosure) {
		capabilities.push(
			disclosureCapability(options.disclosure),
			treeItemGroupLink(options.disclosure)
		);
	}
	return defineArchetypeCapabilities(capabilities, {
		docs: 'Layer 3 recipe for selectable, navigable tree behavior and tree item/group wiring.'
	});
}

export function gridCapabilities<T = unknown>(
	options: GridCapabilitiesOptions<T> = {}
): ArchetypeCapabilities {
	const collection = options.selection || options.roving ? resolveCollection(options) : undefined;
	const capabilities: Capability[] = [rowColumnCellLink(options.rowColumnCell)];
	if (options.selection && collection) {
		capabilities.push(
			...selectableCollectionCapability({
				collection,
				selection: options.selection,
				selectionOptions: options.selectionOptions
			})
		);
	}
	if (options.roving && collection) {
		capabilities.push(
			...navigableCollectionCapability({
				collection,
				roving: options.roving,
				rovingOptions: options.rovingOptions,
				navigation: options.navigation
			})
		);
	}
	return defineArchetypeCapabilities(capabilities, {
		docs: 'Layer 3 recipe for grid relationships plus optional collection selection/navigation.'
	});
}

export function toastCapabilities(options: ToastCapabilitiesOptions): ArchetypeCapabilities {
	const capabilities: Capability[] = [
		disclosureCapability(options.disclosure),
		labelledControl(options.labelled)
	];
	if (options.close !== false) {
		capabilities.push(
			disclosureClose({
				disabled: false,
				stopPropagation: true,
				...options.close
			})
		);
	}
	if (options.status) {
		capabilities.push(statusCapability(options.status, options.statusOptions));
	}
	return defineArchetypeCapabilities(capabilities, {
		docs: 'Layer 3 recipe for toast live-region labelling, dismiss activation, and optional status.'
	});
}

export function fieldCapabilities<T = unknown>(
	options: FieldCapabilitiesOptions<T>
): ArchetypeCapabilities {
	const capabilities: Capability[] = [
		...labelledFieldCapability({
			labelled: options.labelled,
			status: options.status,
			statusOptions: options.statusOptions
		}),
		...validatedControlCapability({
			validation: options.validation,
			validationOptions: options.validationOptions,
			error: options.error,
			status: false
		})
	];
	return defineArchetypeCapabilities(capabilities, {
		docs: 'Layer 3 recipe for a labelled, validated form field with optional field status.'
	});
}

export function datePickerCapabilities<T = unknown>(
	options: DatePickerCapabilitiesOptions<T>
): ArchetypeCapabilities {
	const capabilities: Capability[] = [
		disclosureCapability(options.disclosure),
		triggerContentLink(options.disclosure, {
			haspopup: 'dialog',
			contentRole: 'dialog',
			...options.triggerContent
		})
	];
	if (options.trigger !== false) {
		capabilities.push(disclosureTrigger(options.trigger));
	}
	if (options.close !== false) {
		capabilities.push(disclosureClose(options.close));
	}
	if (options.status) {
		capabilities.push(statusCapability(options.status, options.statusOptions));
	}
	if (options.grid) {
		capabilities.push(...gridCapabilities(options.grid));
	}
	return defineArchetypeCapabilities(capabilities, {
		docs: 'Layer 3 recipe for date-picker disclosure wiring plus optional calendar grid behavior.'
	});
}

function resolveCollection<T>(options: CollectionRecipe<T>): CollectionCapability<T> {
	if (options.collection) return options.collection;
	if (!options.kind) {
		throw new Error('[svelte-atoms] archetype capability requires either `kind` or `collection`.');
	}
	return collectionCapability<T>(options.kind, options.collectionOptions);
}
