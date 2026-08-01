// Internal atom config keys stripped before spreading preset props onto the DOM.
export const PRESET_SKIP = new Set(['class', 'base', 'as', 'variants', 'compounds', 'defaults']);

// Internal config keys stripped before spreading resolved variant objects.
export const VARIANTS_SKIP = new Set(['class', 'variants', 'compounds', 'defaults']);
