/**
 * The Standard Schema v1 contract, vendored.
 *
 * The spec is a types-only interface that schema libraries implement natively — Zod 4, Valibot 1,
 * ArkType 2, Effect Schema. Vendoring it is the sanctioned way to consume it (that is what the
 * spec's own guidance says), and it keeps `@ixirjs/ui` free of a dependency *and* a peer
 * dependency that would otherwise leak into every consumer's install.
 *
 * @see https://standardschema.dev
 */

/** One path step. Libraries emit either a bare key or a `{ key }` object; both are legal. */
export interface StandardSchemaPathSegment {
	readonly key: PropertyKey;
}

export interface StandardSchemaIssue {
	readonly message: string;
	readonly path?: ReadonlyArray<PropertyKey | StandardSchemaPathSegment> | undefined;
}

export type StandardSchemaResult<Output> =
	| { readonly value: Output; readonly issues?: undefined }
	| { readonly issues: readonly StandardSchemaIssue[] };

export interface StandardSchemaProps<Input = unknown, Output = Input> {
	readonly version: 1;
	readonly vendor: string;
	readonly validate: (
		value: unknown
	) => StandardSchemaResult<Output> | Promise<StandardSchemaResult<Output>>;
	readonly types?: { readonly input: Input; readonly output: Output } | undefined;
}

export interface StandardSchemaV1<Input = unknown, Output = Input> {
	readonly '~standard': StandardSchemaProps<Input, Output>;
}

export function isStandardSchema(value: unknown): value is StandardSchemaV1 {
	if (typeof value !== 'object' || value === null) return false;
	const props = (value as { '~standard'?: { validate?: unknown } })['~standard'];
	return typeof props?.validate === 'function';
}
