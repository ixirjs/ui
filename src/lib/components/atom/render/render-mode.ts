import type { ResolvedMotion } from '$ixirjs/ui/preset';

/**
 * Which branch renders an element. One predicate, one place.
 *
 * One predicate prevents Kernel and HtmlElement branch selection from drifting. Historical
 * rationale and measurements live in `docs/research/root-renderer-slot-2026-08.md`.
 *
 * Ordered cheapest-first and escalating only on a positive signal, because nearly every element in a
 * real page is a plain `div` with no motion:
 *
 *   div / dynamic          the six leaves in `element-branches.svelte`, no component boundary
 *   divLocal / dynamicLocal      enter/exit transitions, default (local) scope
 *   divGlobal / dynamicGlobal    enter/exit transitions marked `global`
 *   element                `HtmlElement` — motion that needs a driver but declares no transition
 *                          (`animate` only), or a renderer lifecycle attribute
 *   renderer               custom component/snippet renderer selected by `base`
 *
 * `base` is the only reason left to escalate here, because it names a renderer and something has to
 * render it. `oninit` and symbol lifecycle callbacks used to escalate too, and did not need to: they
 * are work that happens at init, and Kernel runs them there, so those parts stay on a leaf.
 *
 * Takes ALREADY-RESOLVED presentation. It runs once per rendered element, so it must not re-read a
 * props thunk or touch a signal.
 */
export type RenderMode =
	| 'div'
	| 'dynamic'
	| 'divLocal'
	| 'dynamicLocal'
	| 'divGlobal'
	| 'dynamicGlobal'
	| 'element'
	| 'renderer';

/**
 * The five attributes only a renderer component knows how to honour.
 *
 * `global` is listed here AND read by the transition branch below — a deliberate dual role. On a
 * motionless element it means "a renderer must handle this", on a transitioning one it selects
 * between the local and global leaves. Both sites are commented because a single-purpose reading of
 * either one would look like a bug and get "fixed".
 */
function hasLifecycleAttrs(attrs: Record<string | symbol, unknown>): boolean {
	// Value-aware, not key-presence: a part that forwards `onmount={onmount?.bind(bond)}` sets the key
	// unconditionally, so a presence check escalated every such part to a renderer even when the
	// consumer passed no handler at all. An absent handler is no handler.
	return (
		attrs.onmount != null ||
		attrs.ondestroy != null ||
		attrs.onintroend != null ||
		attrs.onexitend != null ||
		// `global` is meaningful when explicitly false, so presence is the right test here.
		'global' in attrs
	);
}

/** Emptiness by early exit: `Object.keys(motion).length` allocates an array to answer yes/no. */
function hasMotion(motion: object): boolean {
	for (const _ in motion) return true;
	return false;
}

export type RenderModeInput = {
	/**
	 * Whether the resolved tag is `div` — the only one that reaches the static-element fast path.
	 *
	 * The boolean rather than the tag string, because the caller renders the tag as well and was
	 * therefore computing `String(as ?? 'div')` twice per element: once to hand it here, once to hand
	 * it to the branch. This predicate never needed the string, only the comparison.
	 */
	isDiv: boolean;
	/** Resolved motion. `enter`/`exit` select a transition leaf; `animate` alone needs the driver. */
	motion: ResolvedMotion<never> | object;
	attrs: Record<string | symbol, unknown>;
	/** A `base` selects a renderer component or snippet; `oninit` is Kernel's init hook. */
	base: unknown;
	/**
	 * Whether a motion instance exists for the transition leaves to drive. False when the part
	 * declared no motion at init — the rune is not created then, so a transition that appears later
	 * escalates instead, which is the path such a part already took.
	 */
	canLeafTransition: boolean;
};

export function renderMode(input: RenderModeInput): RenderMode {
	// `base` names a renderer component or snippet, so only a component can render it. Nothing else
	// escalates here: Kernel already runs `oninit` and symbol lifecycle, and a preset alone never did
	// — preset resolution already happened before this predicate ran, so a
	// preset-only element still reaches a leaf.
	if (input.base !== undefined) return 'renderer';

	const isDiv = input.isDiv;
	if (hasMotion(input.motion)) {
		const motion = input.motion as ResolvedMotion<never>;
		// A transition is inline-only syntax, so it gets its own leaf rather than a parameter.
		if ((motion.enter ?? motion.exit) && input.canLeafTransition) {
			// Global is the DEFAULT, matching `html-element.svelte`'s `global = true` declaration —
			// the renderer this path replaces. Defaulting to local instead silently stops every
			// consumer transition from playing when an ancestor block enters or exits, because a
			// local transition only runs for the block that owns it.
			//
			// `global` also appears in `hasLifecycleAttrs`; that path is reached only by motionless
			// elements, where a renderer really does have to own it. See the note there.
			const isGlobal = !('global' in input.attrs) || input.attrs.global !== false;
			if (isGlobal) return isDiv ? 'divGlobal' : 'dynamicGlobal';
			return isDiv ? 'divLocal' : 'dynamicLocal';
		}
		// Motion with no transition — `animate` driving measured geometry — needs HtmlElement's effects.
		return 'element';
	}

	if (hasLifecycleAttrs(input.attrs)) return 'element';
	return isDiv ? 'div' : 'dynamic';
}
