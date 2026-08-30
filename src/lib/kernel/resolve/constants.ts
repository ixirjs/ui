import { MOTION_KEYS } from './motion';

// Presentation configuration and renderer-owned motion fields never reach a DOM spread.
// Kept in both shapes deliberately: membership tests want the Set, and the per-element probe in
// `fold.ts` wants an array it can index without allocating an iterator.
export const MOTION_SKIP_LIST: readonly string[] = Object.freeze(['motion', ...MOTION_KEYS]);
export const MOTION_SKIP = new Set<string>(MOTION_SKIP_LIST);

export const PRESET_SKIP = new Set([
	'class',
	'attrs',
	'motion',
	'render',
	'base',
	'as',
	'variants',
	'compounds',
	'defaults',
	'attachments',
	...MOTION_KEYS
]);

export const VARIANTS_SKIP = PRESET_SKIP;
