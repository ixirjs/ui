// Standalone so any module can mint a key without pulling in the Bond class graph.
export function bondContextKey(...segments: string[]): string {
	return `@ixirjs/context/${segments.join('/')}`;
}
