import type { Component } from 'svelte';

export type ExampleLoader = () => Promise<{ default: Component }>;

// Replaces internal $lib paths with the public package name for user-facing code blocks.
function transformImports(code: string): string {
	return code.replace(/from\s+'(\$lib\/[^']+)'/g, "from '@svelte-atoms/core'");
}

// Creates an `ex(src)` helper bound to glob-registered example files.
// Pass two import.meta.glob calls (loaders + raw sources); spread result into DocExample.
export function createExampleLoader(
	loaders: Record<string, () => Promise<unknown>>,
	sources: Record<string, string>,
	transform: (code: string) => string = transformImports
) {
	return function ex(src: string): { component: ExampleLoader; code: string } {
		return {
			component: loaders[src] as ExampleLoader,
			code: transform(sources[src] ?? ''),
		};
	};
}
