import type { ClassValue } from 'svelte/elements';
import type { MergedPresetLayers, PresetEntryRecord, PresetEntryValue } from '$ixirjs/ui/preset';
import { extractMotion, mergeMotionConfig } from './motion';
import { presetEntryLayers } from '$ixirjs/ui/preset/context.svelte';
import type { PresetEntry, PresetContext } from '$ixirjs/ui/preset';

// Merge ordered preset records. Only the closed public fields participate.
export function mergePresetRecords(records: PresetEntryRecord[]): PresetEntryRecord | undefined {
	if (records.length === 0) return undefined;
	if (records.length === 1) return records[0];

	const result: PresetEntryRecord = {};
	const classes: ClassValue[] = [];
	const compounds: Array<Record<string, unknown>> = [];
	const variantsList: Array<Record<string, Record<string, unknown>>> = [];

	for (const record of records) {
		if (record.class !== undefined) classes.push(record.class);
		if (record.compounds?.length) compounds.push(...record.compounds);
		if (record.variants) variantsList.push(record.variants);
		if (record.attrs) result.attrs = { ...result.attrs, ...record.attrs };
		if (record.motion !== undefined) {
			const motion = mergeMotionConfig(result.motion, record.motion);
			if (motion !== undefined) result.motion = motion;
		}
		if (record.defaults) result.defaults = { ...result.defaults, ...record.defaults };
		if (record.render) result.render = { ...result.render, ...record.render };
	}

	if (classes.length) result.class = classes.length === 1 ? classes[0]! : classes;
	if (compounds.length) result.compounds = compounds;
	if (variantsList.length) {
		let variants: Record<string, Record<string, unknown>> = {};
		for (const layer of variantsList) variants = mergePresetVariants(variants, layer);
		result.variants = variants;
	}
	return result;
}

function mergePresetVariants(
	base: Record<string, Record<string, unknown>>,
	next: Record<string, Record<string, unknown>>
): Record<string, Record<string, unknown>> {
	const result: Record<string, Record<string, unknown>> = {};
	for (const variantName in base) {
		if (!Object.hasOwn(base, variantName)) continue;
		result[variantName] = { ...base[variantName] };
	}
	for (const variantName in next) {
		if (!Object.hasOwn(next, variantName)) continue;
		const values = (result[variantName] ??= {});
		for (const valueName in next[variantName]) {
			if (!Object.hasOwn(next[variantName], valueName)) continue;
			const baseValue = asRecord(base[variantName]?.[valueName]);
			const nextRaw = next[variantName][valueName];
			const nextValue = asRecord(nextRaw);
			if (!baseValue || !nextValue) {
				values[valueName] = nextRaw;
				continue;
			}

			const mergedValue = { ...baseValue, ...nextValue };
			const motion = mergeMotionConfig(extractMotion(baseValue), extractMotion(nextValue));
			if (motion !== undefined) mergedValue.motion = motion;
			values[valueName] = mergedValue;
		}
	}
	return result;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
	return typeof value === 'object' && value !== null
		? (value as Record<string, unknown>)
		: undefined;
}

function isMergedPresetLayers(value: unknown): value is MergedPresetLayers {
	return (
		typeof value === 'object' &&
		value !== null &&
		(value as { kind?: unknown }).kind === 'merged-preset-layers' &&
		Array.isArray((value as { layers?: unknown }).layers)
	);
}

// Resolve explicit merged-layer shapes. Arrays and nested factories have no preset semantics.
export function resolvePreset(preset: PresetEntryValue | undefined): PresetEntryRecord | undefined {
	if (!preset) return undefined;
	if (!isMergedPresetLayers(preset)) return preset;

	const records: PresetEntryRecord[] = [];
	for (const layer of preset.layers) {
		const record = resolvePreset(layer);
		if (record) records.push(record);
	}
	return mergePresetRecords(records);
}

export type PreparedPresetEntry = {
	readonly entry: PresetEntry;
	readonly resolve: (context: PresetContext) => PresetEntryRecord | undefined;
};
const preparedEntries = new WeakMap<PresetEntry, PreparedPresetEntry>();

/** @internal Prepare composition once at element initialization, not on every value read. */
export function preparePresetEntry(entry: PresetEntry): PreparedPresetEntry | undefined {
	const hit = preparedEntries.get(entry);
	if (hit) return hit;
	const pair = presetEntryLayers(entry);
	if (!pair) return undefined;
	const prepared: PreparedPresetEntry = {
		entry,
		resolve(context) {
			// Evaluate BOTH sides before reading record fields. A later factory can mutate an
			// earlier result. Nested wrappers retain their original evaluation and merge grouping.
			const left = typeof pair[0] === 'function' ? pair[0](context) : pair[0];
			const right = typeof pair[1] === 'function' ? pair[1](context) : pair[1];
			const a = resolvePreset(left);
			const b = resolvePreset(right);
			return a && b ? mergePresetRecords([a, b]) : (a ?? b);
		}
	};
	preparedEntries.set(entry, prepared);
	return prepared;
}
