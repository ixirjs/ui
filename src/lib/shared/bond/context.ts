// Standalone so any module can mint a key without pulling in the Bond class graph.
export function bondContextKey(...segments: string[]): string {
	return `@svelte-atoms/context/${segments.join('/')}`;
}
