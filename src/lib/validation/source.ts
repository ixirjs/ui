import {
	isPromise,
	type ValidationError,
	type ValidationResult
} from '$ixirjs/ui/capability/models/validation.svelte';
import { formatPath, normalizePath, parsePath, segmentsOf, type PathSegment } from './path';
import type {
	StandardSchemaIssue,
	StandardSchemaResult,
	StandardSchemaV1
} from './standard-schema';

/**
 * The one seam between the Form and whoever decides whether it is valid.
 *
 * Two directions, either or both:
 * - **pull** — `validate(values)` is called when the form decides it is time (submit, blur, input).
 *   A Standard Schema lives here.
 * - **push** — `errors` is read reactively. Someone else owns form state and publishes the result:
 *   Superforms, SvelteKit remote form actions, felte, a server round-trip.
 *
 * `FormBond` never learns which kind it was handed.
 */
export interface ValidationSource {
	/** Externally owned errors. Read on every render, so back it with `$state` or a getter. */
	readonly errors?: readonly ValidationError[];
	/**
	 * Asked to validate. May resolve asynchronously. The argument is the form's values object, or
	 * for a field-level schema the field's own value — the schema decides what shape it expects.
	 */
	validate?(values: unknown): ValidationResult | Promise<ValidationResult>;
	/** Set when the source owns the values too, in which case the form defers to it. */
	readonly values?: Record<string, unknown> | undefined;
	/** Set when the source drives submission (Superforms' `enhance`). */
	readonly isSubmitting?: boolean;
}

/** A nested (`{ address: { street: ['…'] } }`) or flat (`{ 'address.street': ['…'] }`) error bag. */
export type ErrorRecord = {
	[key: string]: string[] | ErrorRecord | ErrorRecord[] | undefined;
};

function issueToError(issue: StandardSchemaIssue): ValidationError {
	return { path: segmentsOf(issue.path), message: issue.message };
}

/**
 * Adapt any Standard Schema library — Zod, Valibot, ArkType, Effect — with no per-library code.
 *
 * A schema that *throws* is propagated rather than reported as "no errors". The adapter layer this
 * replaces got that wrong: a malformed schema produced an empty error list, which reads as valid.
 */
export function standardSchemaSource(schema: StandardSchemaV1): ValidationSource {
	return {
		validate(values) {
			const outcome = schema['~standard'].validate(values);
			return isPromise(outcome) ? outcome.then(toResult) : toResult(outcome);
		}
	};
}

function toResult(outcome: StandardSchemaResult<unknown>): ValidationResult {
	if (outcome.issues) return { errors: outcome.issues.map(issueToError) };
	return { data: outcome.value, errors: [] };
}

/**
 * Adapt an externally owned error bag. The thunk is deliberate: the record is re-read inside the
 * caller's tracked boundary, so a store that updates repaints the fields.
 */
export function errorRecordSource(errors: () => ErrorRecord | undefined): ValidationSource {
	return {
		get errors() {
			return flattenErrorRecord(errors());
		}
	};
}

/** Flattens both the nested and the flat bag shape, including Superforms' `_errors` convention. */
export function flattenErrorRecord(record: ErrorRecord | undefined): ValidationError[] {
	const out: ValidationError[] = [];
	walk(record, [], out);
	return out;
}

function walk(node: unknown, prefix: PathSegment[], out: ValidationError[]): void {
	if (node === null || typeof node !== 'object') return;

	if (Array.isArray(node)) {
		// A leaf list of messages, or a list of nested bags (`items: [{ qty: ['…'] }]`).
		if (node.every((entry) => typeof entry === 'string')) {
			for (const message of node as string[]) out.push({ path: [...prefix], message });
			return;
		}
		node.forEach((entry, index) => walk(entry, [...prefix, index], out));
		return;
	}

	for (const [key, value] of Object.entries(node)) {
		// Superforms attaches errors belonging to the container itself under `_errors`.
		if (key === '_errors') walk(value, prefix, out);
		else walk(value, [...prefix, ...parsePath(key)], out);
	}
}

/**
 * Wrap a plain predicate as a Standard Schema, for a library that has not adopted the spec (Yup,
 * Joi) or for a one-off rule. This is the whole replacement for the deleted `CustomValidationAdapter`.
 */
export function defineSchema<Value = unknown>(
	check: (value: Value) => string | string[] | null | undefined | void,
	vendor = 'ixirjs'
): StandardSchemaV1<Value, Value> {
	return {
		'~standard': {
			version: 1,
			vendor,
			validate(value) {
				const outcome = check(value as Value);
				if (!outcome || outcome.length === 0) return { value: value as Value };
				const messages = typeof outcome === 'string' ? [outcome] : outcome;
				return { issues: messages.map((message) => ({ message })) };
			}
		}
	};
}

/** Errors whose path matches `name` exactly, in the canonical string form. */
export function errorsForPath(
	errors: readonly ValidationError[],
	name: string | undefined
): ValidationError[] {
	if (!name) return [];
	const target = normalizePath(name);
	return errors.filter((error) => formatPath(error.path as PathSegment[]) === target);
}
