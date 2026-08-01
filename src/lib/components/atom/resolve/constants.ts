import { MOTION_KEYS } from './motion';

// Presentation configuration and renderer-owned motion fields never reach a DOM spread.
export const MOTION_SKIP = new Set<string>(['motion', ...MOTION_KEYS]);

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

export const VARIANTS_SKIP = new Set(PRESET_SKIP);
