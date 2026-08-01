import { merge } from 'es-toolkit';
import type { ClassValue } from 'svelte/elements';
import { call } from '$svelte-atoms/core/utils/function';
import type { PresetEntryRecord, PresetEntryValue } from '$svelte-atoms/core/context/preset.svelte';

// Merges an ordered list of PresetEntryRecords into a single record.
// class/compounds/attachments: concatenated; variants: deep-merged; defaults: shallow-merged; other fields: last wins.
export function mergePresetRecords(records: PresetEntryRecord[]): PresetEntryRecord | undefined {
	const len = records.length;
	if (!len) return undefined;
	if (len === 1) return records[0];

	const result: PresetEntryRecord = {};
	const classes: ClassValue[] = [];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const compounds: Array<Record<string, any>> = [];
	const attachments: NonNullable<PresetEntryRecord['attachments']> = [];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const variantsList: Array<Record<string, Record<string, any>>> = [];

	for (let i = 0; i < len; i++) {
		const record = records[i];
		if (!record) continue;

		if (record.class !== undefined) classes.push(record.class as ClassValue);

		const recCompounds = record.compounds;
		if (recCompounds?.length) {
			for (let j = 0, jlen = recCompounds.length; j < jlen; j++)
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				compounds.push(recCompounds[j] as Record<string, any>);
		}

		const recAttachments = record.attachments;
		if (recAttachments?.length) {
			for (let j = 0, jlen = recAttachments.length; j < jlen; j++)
				attachments.push(
					recAttachments[j] as NonNullable<PresetEntryRecord['attachments']>[number]
				);
		}

		if (record.variants) variantsList.push(record.variants);

		if (record.defaults)
			result.defaults =
				result.defaults !== undefined
					? { ...result.defaults, ...record.defaults }
					: record.defaults;

		// Copy remaining own keys directly — avoids allocating an intermediate `rest` object.
		// Use hasOwnProperty guard so prototype-chain properties are never copied.
		for (const key in record) {
			if (
				!Object.prototype.hasOwnProperty.call(record, key) ||
				key === 'class' ||
				key === 'compounds' ||
				key === 'attachments' ||
				key === 'variants' ||
				key === 'defaults'
			)
				continue;
			result[key] = record[key];
		}
	}

	if (classes.length) result.class = classes.length === 1 ? (classes[0] as ClassValue) : classes;
	if (compounds.length) result.compounds = compounds;
	if (attachments.length) result.attachments = attachments;

	// Single merge pass over all variant maps — avoids N-1 intermediate objects
	if (variantsList.length) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let merged: Record<string, Record<string, any>> = {};
		for (let j = 0; j < variantsList.length; j++) merged = merge(merged, variantsList[j]!);
		result.variants = merged;
	}

	return result;
}

// Factory-unwrap depth cap — guards against accidental self-returning closures.
const MAX_FACTORY_DEPTH = 8;

// Resolve a preset to its concrete value. Falsy → undefined; array → each entry resolved then
// merged via mergePresetRecords; otherwise unwrap nested factory functions (capped at MAX_FACTORY_DEPTH).
export function resolvePreset(
	preset: PresetEntryValue | Array<PresetEntryValue> | undefined
): PresetEntryRecord | undefined;
export function resolvePreset<T>(preset: T | (() => T) | undefined): T | undefined;
export function resolvePreset(preset: unknown): unknown {
	if (!preset) return undefined;

	if (Array.isArray(preset)) {
		const resolved: PresetEntryRecord[] = [];
		for (const entry of preset) {
			const value = resolvePreset(entry as PresetEntryValue);
			if (value) resolved.push(value as PresetEntryRecord);
		}
		return mergePresetRecords(resolved);
	}

	let result = call(preset);
	for (let depth = 0; typeof result === 'function' && depth < MAX_FACTORY_DEPTH; depth++) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		result = (result as any)();
	}
	return result;
}
