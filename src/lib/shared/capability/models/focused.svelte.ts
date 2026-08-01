import {
	defineFocusedCapability,
	sharedCapabilityKey,
	type Capability,
	type CapabilityMetadata
} from '../capability';
import {
	collectionCapability,
	type CollectionCapability,
	type CollectionProjectionOptions
} from './collection.svelte';
import {
	selectionCapability,
	type SelectionModel,
	type SelectionProjectionOptions
} from './selection.svelte';
import { rovingCapability, type RovingFocus, type RovingProjectionOptions } from './roving.svelte';
import { navigationCapability, type NavigationProjectionOptions } from './navigation.svelte';
import { inputCapability, type InputModel, type InputProjectionOptions } from './input.svelte';
import { typeaheadCapability, type TypeaheadOptions } from './typeahead.svelte';
import {
	labelledControl,
	errorMessageLink,
	type ErrorMessageLinkOptions,
	type LabelledControlOptions
} from './relationship.svelte';
import {
	createStatus,
	statusCapability,
	type StatusModel,
	type StatusProjectionOptions
} from './status.svelte';
import {
	validationCapability,
	type ValidationModel,
	type ValidationProjectionOptions
} from './validation.svelte';

export type FocusedCapabilityBundle = readonly Capability[] & {
	readonly meta: CapabilityMetadata & { readonly layer: 2; readonly kind: 'focused' };
};

export const SELECTABLE_COLLECTION = sharedCapabilityKey<readonly Capability[]>(
	'@svelte-atoms/cap:focused:selectable-collection'
);
export const NAVIGABLE_COLLECTION = sharedCapabilityKey<readonly Capability[]>(
	'@svelte-atoms/cap:focused:navigable-collection'
);
export const FILTERABLE_COLLECTION = sharedCapabilityKey<readonly Capability[]>(
	'@svelte-atoms/cap:focused:filterable-collection'
);
export const LABELLED_FIELD = sharedCapabilityKey<readonly Capability[]>(
	'@svelte-atoms/cap:focused:labelled-field'
);
export const VALIDATED_CONTROL = sharedCapabilityKey<readonly Capability[]>(
	'@svelte-atoms/cap:focused:validated-control'
);

interface CollectionSource<T> {
	kind?: string;
	collection?: CollectionCapability<T>;
	collectionOptions?: CollectionProjectionOptions | undefined;
}

export interface SelectableCollectionCapabilityOptions<T> extends CollectionSource<T> {
	selection: SelectionModel<T>;
	selectionOptions?: SelectionProjectionOptions | undefined;
}

export interface NavigableCollectionCapabilityOptions<T = unknown> extends CollectionSource<T> {
	roving: RovingFocus<T>;
	rovingOptions?: RovingProjectionOptions | undefined;
	navigation?: NavigationProjectionOptions | undefined;
}

export interface FilterableCollectionCapabilityOptions<T = unknown> extends CollectionSource<T> {
	input: InputModel;
	roving: RovingFocus<T>;
	inputOptions?: InputProjectionOptions | undefined;
	typeahead?: TypeaheadOptions<T> | undefined;
}

export interface LabelledFieldCapabilityOptions {
	labelled?: LabelledControlOptions | undefined;
	status?: StatusModel | undefined;
	statusOptions?: StatusProjectionOptions | undefined;
}

export interface ValidatedControlCapabilityOptions<T = unknown> {
	validation: ValidationModel<T>;
	validationOptions?: ValidationProjectionOptions | undefined;
	error?: ErrorMessageLinkOptions | undefined;
	status?: StatusModel | false | undefined;
	statusOptions?: StatusProjectionOptions | undefined;
}

export function selectableCollectionCapability<T>(
	options: SelectableCollectionCapabilityOptions<T>
): FocusedCapabilityBundle {
	const collection = resolveCollection(options);
	return focusedCapabilities(
		SELECTABLE_COLLECTION,
		[collection, selectionCapability(options.selection, options.selectionOptions)],
		{
			projects: ['container', 'item'],
			docs: 'Layer 2 bundle for collection registration plus selected item projection.'
		}
	);
}

export function navigableCollectionCapability<T = unknown>(
	options: NavigableCollectionCapabilityOptions<T>
): FocusedCapabilityBundle {
	const collection = resolveCollection(options);
	return focusedCapabilities(
		NAVIGABLE_COLLECTION,
		[
			collection,
			rovingCapability(options.roving, options.rovingOptions),
			navigationCapability(options.roving, options.navigation)
		],
		{
			projects: ['container', 'item'],
			docs: 'Layer 2 bundle for collection-backed roving focus and keyboard navigation.'
		}
	);
}

export function filterableCollectionCapability<T = unknown>(
	options: FilterableCollectionCapabilityOptions<T>
): FocusedCapabilityBundle {
	const collection = resolveCollection(options);
	return focusedCapabilities(
		FILTERABLE_COLLECTION,
		[
			collection,
			rovingCapability(options.roving),
			inputCapability(options.input, options.inputOptions),
			typeaheadCapability(collection.surface, options.roving, options.typeahead)
		],
		{
			projects: ['container', 'item', 'input'],
			docs: 'Layer 2 bundle for input-driven collection filtering and typeahead navigation.'
		}
	);
}

export function labelledFieldCapability(
	options: LabelledFieldCapabilityOptions = {}
): FocusedCapabilityBundle {
	const capabilities: Capability[] = [labelledControl(options.labelled)];
	if (options.status) {
		capabilities.push(statusCapability(options.status, options.statusOptions));
	}
	return focusedCapabilities(LABELLED_FIELD, capabilities, {
		projects: ['label', 'description', 'control'],
		docs: 'Layer 2 bundle for labelled controls with optional scoped status projection.'
	});
}

export function validatedControlCapability<T = unknown>(
	options: ValidatedControlCapabilityOptions<T>
): FocusedCapabilityBundle {
	const status =
		options.status === false
			? undefined
			: (options.status ??
				createStatus({
					invalid: () => options.validation.isInvalid,
					busy: () => options.validation.isValidating
				}));
	const capabilities: Capability[] = [
		validationCapability(options.validation, options.validationOptions),
		errorMessageLink({
			invalid: () => options.validation.isInvalid,
			...options.error
		})
	];
	if (status) {
		capabilities.push(statusCapability(status, options.statusOptions));
	}
	return focusedCapabilities(VALIDATED_CONTROL, capabilities, {
		projects: ['control', 'error'],
		docs: 'Layer 2 bundle for validation state, error-message linkage, and validation status.'
	});
}

function resolveCollection<T>(options: CollectionSource<T>): CollectionCapability<T> {
	if (options.collection) return options.collection;
	if (!options.kind) {
		throw new Error(
			'[svelte-atoms] focused collection capability requires either `kind` or `collection`.'
		);
	}
	return collectionCapability<T>(options.kind, options.collectionOptions);
}

function focusedCapabilities(
	slot: symbol,
	capabilities: readonly Capability[],
	meta: Omit<CapabilityMetadata, 'layer' | 'kind'>
): FocusedCapabilityBundle {
	const marker = defineFocusedCapability({ slot, capabilities, meta });
	return Object.assign([marker, ...capabilities], {
		meta: marker.meta as CapabilityMetadata & { readonly layer: 2; readonly kind: 'focused' }
	}) as FocusedCapabilityBundle;
}
