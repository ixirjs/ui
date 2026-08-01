import { onDestroy } from 'svelte';
import { DEV } from 'esm-env';
import type { Bond } from '../bond';

// Normalize a capability's setup() return — a teardown function or a Disposable (Symbol.dispose) —
// into a plain teardown thunk. A Disposable lets a capability hand back a `using`-managed resource
// (e.g. a DisposableStack) without us depending on the global at runtime.
function toTeardown(live: Disposable | (() => void)): () => void {
	if (typeof live === 'function') return live;
	return () => live[Symbol.dispose]();
}

// Run every registered capability's setup() once, at root component init, and aggregate their
// teardowns into onDestroy. The single home for whole-bond effects (focus restore, document
// listeners, subscriptions) that no individual atom owns. Call once from a bond's root component,
// after the bond is constructed. Capabilities without a setup() are skipped.
//
// Teardown runs LIFO — the last setup to run is the first torn down — mirroring `using`/DisposableStack
// semantics, so a later capability that depends on an earlier one's effect unwinds in dependency order.
export function useCapabilities(bond: Bond | undefined): void {
	if (!bond) return;

	// Record that whole-bond effects are now live, so the DEV guard that fires when a setup()-bearing
	// bond was never wired stays quiet for correctly-wired roots.
	bond.state.markSetupConsumed();

	const teardowns: Array<() => void> = [];
	try {
		for (const capability of bond.state.capabilities) {
			const live = capability.setup?.(bond);
			if (live) teardowns.push(toTeardown(live));
		}
	} catch (error) {
		for (let i = teardowns.length - 1; i >= 0; i--) {
			try {
				teardowns[i]!();
			} catch (teardownError) {
				if (DEV) {
					console.error(
						'[svelte-atoms] capability setup failed, and a previously registered teardown also failed.',
						teardownError
					);
				}
			}
		}
		throw error;
	}

	if (teardowns.length > 0) {
		onDestroy(() => {
			for (let i = teardowns.length - 1; i >= 0; i--) teardowns[i]!();
		});
	}
}
