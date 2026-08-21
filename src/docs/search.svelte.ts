import { createContext } from 'svelte';

/**
 * Whether the ⌘K palette is open.
 *
 * One palette is mounted, in the header; anything else that wants to open it (the 404 page's
 * search button) flips this rather than mounting a second copy. Context, not a module-level rune,
 * so the state stays per request on the server.
 */
export const [getSearch, shareSearch] = createContext<{ open: boolean }>();

export function createSearch() {
	// `$state(...)` only compiles as a declaration initializer — never as a call argument.
	const search = $state({ open: false });
	return shareSearch(search);
}
