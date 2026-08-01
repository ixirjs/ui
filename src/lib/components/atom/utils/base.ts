// Returns `true` when `base` is a Svelte 5 snippet (arrow fn, no `.prototype`)
// rather than a component (named fn with `.prototype`).
export function isSnippetBase(base: unknown): boolean {
	return typeof base === 'function' && !base.prototype;
}
