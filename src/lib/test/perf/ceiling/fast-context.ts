/**
 * The minimum a "fast" part needs from its root: the id seed, nothing else.
 *
 * Deliberately a bare Svelte context holding a string, not a Bond. The whole point of the ceiling
 * spike is to price a part that skips Bond lookup, Atom construction, registration and capability
 * activation — so the stand-in has to be the cheapest thing that can still produce the same ids.
 */
import { getContext, setContext } from 'svelte';
import { getPreset } from '$ixirjs/ui/preset/context.svelte';
import { mergeClassesWithPreset } from '$ixirjs/ui/kernel/resolve/classes';
import type { PresetModuleName } from '$ixirjs/ui/preset';

const SEED = Symbol('ceiling.seed');

export const setSeed = (seed: string) => setContext(SEED, seed);
export const getSeed = () => getContext<string>(SEED);

/**
 * Resolve one part's class the way the real pipeline ends up doing it: look the preset entry up by
 * key, call it, and merge through the same `$preset` sentinel path. This is the cost a fast path
 * cannot avoid if it is to produce identical output — everything else (presentation snapshot,
 * variants, fold, attrs merge) is what the spike is trying to skip.
 */
export function fastClass(base: string, key: PresetModuleName): string {
	const entry = getPreset(key);
	// `PresetEntryValue` is a union that also covers layered records; every entry in `defaultPreset`
	// is the plain `{ class }` shape, and the spike only measures that shape by design — a part whose
	// preset carries variants or layers is exactly the case a conditional fast path would decline.
	const record = entry?.({ bond: undefined, props: {} } as never) as
		| { class?: unknown }
		| undefined;
	return mergeClassesWithPreset(base, record?.class as never, undefined);
}
