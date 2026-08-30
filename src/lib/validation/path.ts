import type { StandardSchemaIssue, StandardSchemaPathSegment } from './standard-schema';

export type PathSegment = string | number;

const SEGMENT = /[^.[\]]+/g;

function isIndex(segment: string): boolean {
	return segment !== '' && /^\d+$/.test(segment);
}

/**
 * Split a field `name` into segments. `address.street` and `items[0].qty` are both accepted, and
 * a numeric segment becomes a number so `setByPath` knows to create an array rather than an object.
 */
export function parsePath(name: string): PathSegment[] {
	return (name.match(SEGMENT) ?? []).map((part) => (isIndex(part) ? Number(part) : part));
}

/** Normalize a Standard Schema issue path — libraries emit bare keys or `{ key }` objects. */
export function segmentsOf(path: StandardSchemaIssue['path']): PathSegment[] {
	if (!path) return [];
	return path.map((step) => {
		const key =
			typeof step === 'object' && step !== null ? (step as StandardSchemaPathSegment).key : step;
		if (typeof key === 'number') return key;
		const text = String(key);
		return isIndex(text) ? Number(text) : text;
	});
}

/**
 * The canonical string form — the key errors are routed by. Field `name`s and issue paths are both
 * put through it, so `items.0.qty` and `items[0].qty` match each other.
 */
export function formatPath(segments: readonly PathSegment[]): string {
	let out = '';
	for (const segment of segments) {
		if (typeof segment === 'number') out += `[${segment}]`;
		else out += out === '' ? segment : `.${segment}`;
	}
	return out;
}

/** `formatPath(parsePath(name))` — the form a `name` prop must be in before it is compared. */
export function normalizePath(name: string): string {
	return formatPath(parsePath(name));
}

/** Writes `value` at `segments`, creating arrays for numeric steps and objects for the rest. */
export function setByPath(
	target: Record<string, unknown>,
	segments: readonly PathSegment[],
	value: unknown
): Record<string, unknown> {
	if (segments.length === 0) return target;

	let current: Record<PathSegment, unknown> = target;
	for (let i = 0; i < segments.length - 1; i++) {
		const segment = segments[i]!;
		const existing = current[segment];
		if (existing === null || typeof existing !== 'object') {
			current[segment] = typeof segments[i + 1] === 'number' ? [] : {};
		}
		current = current[segment] as Record<PathSegment, unknown>;
	}

	current[segments[segments.length - 1]!] = value;
	return target;
}
