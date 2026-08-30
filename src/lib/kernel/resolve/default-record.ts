import { defaultPreset } from '$ixirjs/ui/preset/default';
import type { PresetEntry, PresetEntryRecord, PresetModuleName } from '$ixirjs/ui/preset';

const EMPTY_CONTEXT = Object.freeze({ bond: undefined, props: Object.freeze({}) });
const defaultRecords = new WeakMap<object, PresetEntryRecord>();

/**
 * The default preset's entry for `key`, resolved ONCE, when it is a class-only record.
 *
 * Shared by the class-only lane (`klass()`) and the rich lane (`resolveEntry`): both used to treat a
 * function entry as reactive and call it per part per resolution, which for the library's own
 * `defaultPreset` is a factory returning the same `{ class }` every time. Only that preset and only
 * a class-only result are cached — any other entry may read the Bond it is handed.
 */
export function simpleRecord(
	entry: PresetEntry | undefined,
	key: PresetModuleName
): PresetEntryRecord | undefined {
	if (!entry) return undefined;
	if (typeof entry !== 'function') return isClassOnly(entry) ? entry : undefined;
	if (entry !== defaultPreset[key]) return undefined;
	let record = defaultRecords.get(entry);
	if (!record) {
		const value = entry(EMPTY_CONTEXT as never);
		if (!isClassOnly(value)) return undefined;
		record = value;
		defaultRecords.set(entry, record);
	}
	return record;
}

function isClassOnly(value: unknown): value is PresetEntryRecord {
	if (!value || typeof value !== 'object' || 'kind' in value) return false;
	for (const key in value) if (key !== 'class') return false;
	return true;
}
