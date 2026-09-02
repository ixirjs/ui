// The shadcn-svelte `utils` registry item (fetched with the components — see provenance.json).
// Kept as its own file rather than folded into the fetch script because every vendored component
// imports it and the CLI writes it the same way.
//
// One deviation from what the CLI writes: `clsx` and `twMerge` come from `cn`, which re-exports
// both output-identically, so the benchmark does not hold two class-merging dependencies alive
// for the opponent alone. Both sides merge through the same engine.
import { clsx, twMerge, type ClassValue } from 'cn';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
