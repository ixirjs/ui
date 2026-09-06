import type { Snippet } from 'svelte';
import {
	divPlain,
	headingPlain,
	divBranch,
	headingBranch,
	buttonBranch,
	dynamicBranch,
	divLocal,
	dynamicLocal,
	divGlobal,
	dynamicGlobal,
	type ElementView,
	type ElementBody
} from '$ixirjs/ui/kernel/render/element-branches.svelte';

// The pre-baseline inferred signature. The typed aliases must accept exactly the same calls.
type Before = (view: ElementView, body?: ElementBody, arg?: unknown) => ReturnType<Snippet>;
export function checkBranches(view: ElementView, body: ElementBody, arg: unknown) {
	for (const branch of [
		divPlain,
		headingPlain,
		divBranch,
		headingBranch,
		buttonBranch,
		dynamicBranch,
		divLocal,
		dynamicLocal,
		divGlobal,
		dynamicGlobal
	]) {
		const before: Before = branch;
		const after: typeof branch = before;
		after(view);
		after(view, body);
		after(view, body, arg);
	}
}
