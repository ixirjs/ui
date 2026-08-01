import type { Bond } from './bond.svelte';
import type { RoleProjectionInfo } from '../capability/capability';

// Diagnostic helpers live outside Bond so the runtime hub stays focused on coordination.
export function explainBondRole(bond: Bond, role: string, ctx?: unknown): RoleProjectionInfo[] {
	const out: RoleProjectionInfo[] = [];
	for (const cap of bond.state.capabilities) {
		const behavior = cap.behavior?.(role, ctx);
		if (!behavior) continue;
		out.push({
			slot: cap.slot,
			description: cap.slot.description,
			...(cap.meta ? { meta: cap.meta } : {}),
			...(behavior.attrs ? { attrs: behavior.attrs(bond) } : {}),
			...(behavior.handlers ? { handlers: behavior.handlers(bond) } : {}),
			hasOnmount: typeof behavior.onmount === 'function'
		});
	}
	return out;
}
