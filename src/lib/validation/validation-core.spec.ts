import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
	defineSchema,
	errorRecordSource,
	errorsForPath,
	flattenErrorRecord,
	formatPath,
	isStandardSchema,
	normalizePath,
	parsePath,
	segmentsOf,
	setByPath,
	standardSchemaSource,
	type StandardSchemaV1
} from './index';
import type { ValidationResult } from '$ixirjs/ui/capability/models/validation.svelte';

function sync(result: ValidationResult | Promise<ValidationResult>): ValidationResult {
	if (result instanceof Promise) throw new Error('expected a synchronous result');
	return result;
}

describe('path', () => {
	it('parses both dot and bracket notation to the same segments', () => {
		expect(parsePath('address.street')).toEqual(['address', 'street']);
		expect(parsePath('items[0].qty')).toEqual(['items', 0, 'qty']);
		expect(parsePath('items.0.qty')).toEqual(['items', 0, 'qty']);
		expect(parsePath('')).toEqual([]);
	});

	it('formats to one canonical string, so the two notations match each other', () => {
		expect(formatPath(['items', 0, 'qty'])).toBe('items[0].qty');
		expect(normalizePath('items.0.qty')).toBe(normalizePath('items[0].qty'));
	});

	it('normalizes Standard Schema path segments in either shape libraries emit', () => {
		expect(segmentsOf(['address', 'street'])).toEqual(['address', 'street']);
		expect(segmentsOf([{ key: 'items' }, { key: 0 }, { key: 'qty' }])).toEqual(['items', 0, 'qty']);
		expect(segmentsOf(undefined)).toEqual([]);
	});

	it('writes values by path, creating arrays for numeric steps', () => {
		const target: Record<string, unknown> = {};
		setByPath(target, parsePath('address.street'), '12 Rue');
		setByPath(target, parsePath('items[1].qty'), 3);

		expect(target).toEqual({ address: { street: '12 Rue' }, items: [undefined, { qty: 3 }] });
		expect(Array.isArray((target as { items: unknown }).items)).toBe(true);
	});
});

describe('standardSchemaSource', () => {
	it('accepts a real Zod schema with no adapter and maps issue paths', () => {
		const schema = z.object({
			address: z.object({ street: z.string().min(1, 'Street is required') })
		});
		expect(isStandardSchema(schema)).toBe(true);

		const result = sync(standardSchemaSource(schema).validate!({ address: { street: '' } }));
		expect(result.errors).toEqual([{ path: ['address', 'street'], message: 'Street is required' }]);
	});

	it('reports no errors and returns the parsed data when the value passes', () => {
		const schema = z.object({ name: z.string() });
		const result = sync(standardSchemaSource(schema).validate!({ name: 'ada' }));

		expect(result.errors).toEqual([]);
		expect(result.data).toEqual({ name: 'ada' });
	});

	it('awaits a schema that validates asynchronously', async () => {
		const schema: StandardSchemaV1 = {
			'~standard': {
				version: 1,
				vendor: 'test',
				validate: async () => ({ issues: [{ message: 'Taken', path: ['email'] }] })
			}
		};

		const result = await standardSchemaSource(schema).validate!({});
		expect(result.errors).toEqual([{ path: ['email'], message: 'Taken' }]);
	});

	it('propagates a schema that throws instead of reporting it as valid', () => {
		// The regression this whole rewrite turns on: the deleted Yup adapter caught everything and
		// produced an empty error list, which every reader downstream saw as "valid".
		const schema: StandardSchemaV1 = {
			'~standard': {
				version: 1,
				vendor: 'test',
				validate: () => {
					throw new TypeError('schema is malformed');
				}
			}
		};

		expect(() => standardSchemaSource(schema).validate!({})).toThrow(TypeError);
	});
});

describe('defineSchema', () => {
	it('wraps a plain predicate as a Standard Schema', () => {
		const schema = defineSchema<string>((value) => (value.length > 2 ? undefined : 'Too short'));

		expect(isStandardSchema(schema)).toBe(true);
		expect(sync(standardSchemaSource(schema).validate!('ok!')).errors).toEqual([]);
		expect(sync(standardSchemaSource(schema).validate!('x')).errors).toEqual([
			{ path: [], message: 'Too short' }
		]);
	});

	it('accepts a list of messages', () => {
		const schema = defineSchema<string>(() => ['Too short', 'No digits']);
		expect(sync(standardSchemaSource(schema).validate!('x')).errors).toHaveLength(2);
	});
});

describe('flattenErrorRecord', () => {
	it('flattens the nested bag Superforms publishes, including _errors', () => {
		expect(
			flattenErrorRecord({
				name: ['Required'],
				address: { street: ['Required'] },
				items: { _errors: ['Too few'], 0: { qty: ['Must be positive'] } }
			})
			// Integer-like keys enumerate before string keys, so `0` precedes `_errors` here.
		).toEqual([
			{ path: ['name'], message: 'Required' },
			{ path: ['address', 'street'], message: 'Required' },
			{ path: ['items', 0, 'qty'], message: 'Must be positive' },
			{ path: ['items'], message: 'Too few' }
		]);
	});

	it('flattens a flat bag whose keys are already paths', () => {
		expect(flattenErrorRecord({ 'address.street': ['Required'] })).toEqual([
			{ path: ['address', 'street'], message: 'Required' }
		]);
	});

	it('reads through the thunk on every call, so a source stays live', () => {
		let bag = { name: ['Required'] };
		const source = errorRecordSource(() => bag);
		expect(source.errors).toHaveLength(1);

		bag = { name: [] };
		expect(source.errors).toHaveLength(0);
	});
});

describe('errorsForPath', () => {
	const errors = [
		{ path: ['address', 'street'], message: 'Required' },
		{ path: ['items', 0, 'qty'], message: 'Must be positive' },
		{ path: ['name'], message: 'Required' }
	];

	it('matches a field name against issue paths in either notation', () => {
		expect(errorsForPath(errors, 'address.street')).toHaveLength(1);
		expect(errorsForPath(errors, 'items[0].qty')).toHaveLength(1);
		expect(errorsForPath(errors, 'items.0.qty')).toHaveLength(1);
	});

	it('does not match a prefix, a sibling, or a nameless field', () => {
		expect(errorsForPath(errors, 'address')).toEqual([]);
		expect(errorsForPath(errors, 'items[1].qty')).toEqual([]);
		expect(errorsForPath(errors, undefined)).toEqual([]);
	});
});
