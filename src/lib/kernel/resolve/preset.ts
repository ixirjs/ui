import type { ClassValue } from 'svelte/elements';
import type { MergedPresetLayers, PresetEntryRecord, PresetEntryValue } from '$ixirjs/ui/preset';
import { extractMotion, mergeMotionConfig } from './motion';

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
