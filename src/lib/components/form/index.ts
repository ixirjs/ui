export * from './types';
export { Root as Form } from './atoms';
export { Field } from './field';

export type { FieldStateProps, ValidationTrigger } from './field/bond.svelte';
export type { ValidationMode } from './bond.svelte';

export {
	superformsSource,
	type SuperFormLike,
	type ReadableLike
} from './sources/superforms.svelte';

// The validation contract itself is shared, not Form-specific — re-exported here because Form is
// where consumers meet it.
export {
	defineSchema,
	errorRecordSource,
	errorsForPath,
	flattenErrorRecord,
	isStandardSchema,
	standardSchemaSource,
	type ErrorRecord,
	type StandardSchemaV1,
	type ValidationSource
} from '$ixirjs/ui/validation';
export type {
	ValidationError,
	ValidationResult
} from '$ixirjs/ui/capability/models/validation.svelte';
