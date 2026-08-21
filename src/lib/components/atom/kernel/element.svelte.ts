import { BROWSER, DEV } from 'esm-env';
import type { Component } from 'svelte';
import type { ClassValue } from 'svelte/elements';
import type { Bond } from '$ixirjs/ui/shared/bond';
import type { PresetKey, PresetLike } from '$ixirjs/ui/preset';
import {
	mergeAtomPresentationProps,
	type PresentableAtom
} from '$ixirjs/ui/shared/bond/presentation-props';
import { toClassValue } from '$ixirjs/ui/utils';
import { HtmlElement } from '$ixirjs/ui/components/element';
import { withDefaultBorder } from '$ixirjs/ui/components/element/class';
import SnippetAdapter from '../snippet.svelte';
import {
	createPresentation,
	presentationRegistry,
	resolvePresentation,
	type PresentationValues
} from '../presentation.svelte';
import { declaresTransition } from '../resolve/motion';
import { hasMintedLifecycleKeys, isLifecycleKey, runLifecycle } from '../render/lifecycle.svelte';
import { renderMode, type RenderMode } from '../render/render-mode';
import { KERNEL_PROP_NAMES } from '../render/kernel-props';
import {
	resolveRendererComponent,
	resolveRendererProps,
	resolveRenderTarget
} from '../render/render-target';
import {
	useElementMotion,
	type ElementMotion
} from '$ixirjs/ui/components/element/use-element-motion.svelte';

/**
 * Kernel's element preparation stage. One config thunk carries rich render props and element
 * attributes; ordinary object-literal order defines precedence. Kernel resolves presentation,
 * lifecycle, motion and custom renderers here before `Kernel.render` selects a compiled leaf.
 */
export type KernelElementSeam = {
	readonly atom: PresentableAtom;
	readonly bond: Bond | undefined;
	readonly preset: PresetKey | undefined;
	readonly presetLayer: PresetLike | undefined;
};

/** Rich render props plus arbitrary element attributes. */
export type KernelElementProps = Record<string | symbol, unknown>;

/** Shared frozen seam for static components that own no Bond or Atom. */
export const STATIC_KERNEL_SEAM: KernelElementSeam = Object.freeze({
	atom: undefined,
	bond: undefined,
	preset: undefined,
	presetLayer: undefined
});

export type KernelElementConfig = () => KernelElementProps;

export type KernelRenderer = {
	component: Component;
	props: Record<string | symbol, unknown>;
};

export type KernelElement = {
	/** The part/root seam handle, for the rich fallback and for callers needing bond/atom. */
	readonly seam: KernelElementSeam;
	/**
	 * Which branch renders this part — one of the six leaves in `element-branches.svelte`, or an
	 * escalation to `HtmlElement` or a custom renderer. See `render/render-mode.ts`.
	 */
	mode(): RenderMode;
	tag(): string;
	class(): string;
	attrs(): Record<string | symbol, unknown>;
	/**
	 * `class` folded into the attrs — the one object a leaf spreads.
	 *
	 * Memoized on the presentation rather than built per read: `class={c} {...attrs}` compiled to a
	 * merge that copied every attribute of every element on every render. The leaves now copy
	 * nothing, and this recomputes only when the presentation itself changes.
	 */
	spread(): Record<string | symbol, unknown>;
	/** Fully resolved custom renderer. */
	renderer(): KernelRenderer;
	/** The motion instance the transition leaves drive, or undefined when this part declared none. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	motion(): ElementMotion<any> | undefined;
	/**
	 * The RESOLVED motion layer, as folded by the presentation. Distinct from `motion()`, which is the
	 * rune: the `element` branch renders `HtmlElement` directly and needs the raw layer to forward,
	 * and it is exactly the path where no rune exists (a driver-only `animate`, not a transition).
	 */
	resolvedMotion(): object;
};

/**
 * The one object every attribute-less element shares, and the signal that selects a plain leaf.
 *
 * A part whose config carries nothing but kernel props — `DataGrid.Cell`, every static leaf that
 * takes only `class` — used to get its own empty object, which `foldPresentationAttrs` then passed
 * straight through. Identity is therefore an O(1) answer to "does this element have any attribute
 * besides its class", which is what `mode()` needs to reach `divPlain`; counting keys would mean a
 * walk per rendered part to learn there was nothing to walk.
 *
 * Frozen because it is shared: attrs are documented as immutable here and in `foldPresentationAttrs`,
 * and a write that breaks that rule should throw at the write rather than corrupt every other part.
 */
export const EMPTY_ATTRS: Record<string, unknown> = Object.freeze({});

/** Element attributes only — the named props are consumed by the presentation axes above. */
function elementAttrs(source: KernelElementProps): Record<string, unknown> {
	let rest: Record<string, unknown> | undefined;
	// `for…in` without `hasOwn`, for the reason `KernelNode.spread()` states: every config reaching
	// here is a fresh object literal (or a rest-props proxy), so it inherits nothing enumerable and
	// the guard was one call per key per rendered element to prove it.
	for (const key in source) {
		if (KERNEL_PROP_NAMES.has(key)) continue;
		(rest ??= {})[key] = source[key];
	}
	// `part` is a named rich prop but remains the CSS shadow-parts attribute.
	if (typeof source.part === 'string') (rest ??= {}).part = source.part;
	// Attachment keys and lifecycle callbacks ride symbol keys and must survive the split.
	const symbolSource = source as Record<string | symbol, unknown>;
	for (const symbol of Object.getOwnPropertySymbols(source)) {
		(rest ??= {})[symbol as unknown as string] = symbolSource[symbol];
	}
	return rest ?? EMPTY_ATTRS;
}

export function useKernelElement(
	seam: KernelElementSeam,
	config: KernelElementConfig,
	elementAttributes?: () => Record<string | symbol, unknown>
): KernelElement {
	// The seam carries its Bond explicitly; element preparation performs no extra context read.

	// A `KernelNode` resolves its own element at init when its props are already rich (see the lane
	// note in its constructor). Building a second one here would register a second set of lifecycle
	// and motion effects against the same part — `oninit` twice, `onmount` twice — so the invariant
	// is enforced rather than left to the authoring rule. Duck-typed because `KernelElementSeam`
	// deliberately does not know about nodes, and the import would be a cycle.
	if (DEV && (seam as { element?: unknown }).element) {
		throw new Error(
			'[ixirjs] Kernel.element() was handed a node that already resolved its own element. ' +
				'Render the node directly, or read `node.element` — building a second element ' +
				'duplicates this part’s lifecycle and motion effects.'
		);
	}

	// Server fast path: a server render is a single pass with no invalidations, so the config can
	// only ever be evaluated once — the two `$derived` below and their `once()` wrappers are pure
	// overhead there. The presentation seam already resolves eagerly server-side for the same
	// reason (see createPresentation's server branch).
	if (!BROWSER) {
		const props = config();
		const attrs = elementAttributes?.() ?? elementAttrs(props);
		return buildKernelElement(
			seam,
			() => props,
			() => attrs
		);
	}

	// One config call per invalidation, shared by every axis below. The thunk returns a fresh
	// object (it spreads the part's rest props), so calling it once per presentation getter would
	// allocate ten times per resolution — the reason this module carries the runes extension.
	// `elementAttrs` runs inside the snapshot's own tracked evaluation instead of holding a second
	// signal: the snapshot was its only consumer, so the extra `$derived` bought no memoization —
	// just one more signal on every rendered part (rows × cells of them in a grid).
	const props = $derived(config());
	return buildKernelElement(
		seam,
		() => props,
		() => elementAttributes?.() ?? elementAttrs(props)
	);
}

function buildKernelElement(
	seam: KernelElementSeam,
	props: () => KernelElementProps,
	attrs: () => Record<string | symbol, unknown>
): KernelElement {
	// Atom-less seam (static leaves like DataGrid.Cell): forward attrs by reference.
	const restPropsFor = (
		current: KernelElementProps,
		elementAttributes: Record<string | symbol, unknown>
	) => {
		const atom = (current.atom as PresentableAtom) ?? seam.atom;
		return atom ? mergeAtomPresentationProps(atom, elementAttributes) : elementAttributes;
	};

	// Explicit config props win over seam defaults.
	const valuesFrom = (current: KernelElementProps): PresentationValues => ({
		preset: (current.preset as PresetKey | undefined) ?? seam.preset,
		bond: (current.bond as Bond | undefined) ?? seam.bond,
		instance: (current.presetLayer as PresetLike | undefined) ?? seam.presetLayer,
		class: current.class as ClassValue,
		as: current.as,
		base: current.base,
		variants: current.variants as never,
		// Bond state props ride this axis to select preset variants without leaking onto the DOM
		// as attributes — roots pass `variantProps: root.props` instead of spreading `...root.props`.
		variantProps: current.variantProps as Record<string, unknown> | undefined,
		defaults: current.defaults as Record<string, unknown> | undefined,
		motion: current.motion as never,
		restProps: restPropsFor(current, attrs())
	});

	const declared = props();

	/**
	 * Bond lifecycle, owned here for every Kernel rendering path.
	 *
	 * `oninit` and symbol lifecycle callbacks are init-time work and this helper runs at init, so
	 * they no longer cost a component boundary — `renderMode` escalates for `base` alone.
	 *
	 * Props come from the ATOM-MERGED object, not the raw config: a lifecycle symbol can arrive
	 * through an Atom's `presentationSpread`, and classifying from the config alone would miss it.
	 * The merge is not paid unless needed — `runLifecycle` checks `hasMintedKeys()` first and returns
	 * before registering any effect when there is nothing to fire.
	 *
	 * Kernel owns lifecycle for every rendering path.
	 */
	//
	// Guarded rather than called unconditionally: `runLifecycle` returns before doing anything when
	// no lifecycle key has ever been minted and no `oninit` was passed, which is every part in the
	// library, but the three thunks are allocated to reach that early exit. The guard asks the same
	// two questions the early exit does, without allocating to ask them.
	if (declared.oninit !== undefined || hasMintedLifecycleKeys()) {
		runLifecycle(
			() => restPropsFor(props(), attrs()),
			() => (props().bond as Bond | undefined) ?? seam.bond,
			() => props().oninit as never
		);
	}

	// Server: resolve from plain values. The thunk shape below exists so the browser can read every
	// axis inside one tracked evaluation; a server render has no tracking to do, so it was eleven
	// closure allocations and eleven calls per rendered part to hand over values already in hand.
	// `(anonymous)` closures plus GC were ~21% of SSR self time on a card page.
	//
	// The browser keeps `createPresentation`: its `$derived` must re-read each axis on invalidation,
	// which is exactly what the thunks are for.
	const presentation = !BROWSER
		? resolvePresentation(valuesFrom(props()), presentationRegistry())
		: createPresentation({
				preset: () => (props().preset as PresetKey | undefined) ?? seam.preset,
				bond: () => (props().bond as Bond | undefined) ?? seam.bond,
				instance: () => (props().presetLayer as PresetLike | undefined) ?? seam.presetLayer,
				class: () => props().class as ClassValue,
				as: () => props().as,
				base: () => props().base,
				variants: () => props().variants as never,
				variantProps: () => props().variantProps as Record<string, unknown> | undefined,
				defaults: () => props().defaults as Record<string, unknown> | undefined,
				motion: () => props().motion as never,
				restProps: () => restPropsFor(props(), attrs())
			});

	// Symbol lifecycle callbacks are classified once at init — that is their documented contract
	// (see runLifecycle). Kernel retains single ownership across every render mode. Classification
	// reads the shared props evaluation, so
	// it costs no second config() call on either pass — the old shape re-evaluated the thunk here,
	// allocating one extra props object per rendered part.

	// The motion instance the four transition leaves drive, gated on the CONSUMER's declaration — read
	// off the `props()` call the lifecycle classification above already made. The predicate and the
	// reasons behind it live next to `extractMotion` in `resolve/motion.ts`; every Kernel path reaches
	// this same gate, preventing render decisions from drifting.
	//
	// A conditional call at init is legal; a deferred one is not — `useElementMotion` owns `$effect`s.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const motion: ElementMotion<any> | undefined = declaresTransition(declared)
		? // eslint-disable-next-line @typescript-eslint/no-explicit-any
			useElementMotion<any>({
				motion: () => presentation.motion as never,
				onmount: () => presentation.attrs.onmount as never,
				ondestroy: () => presentation.attrs.ondestroy as never,
				onintroend: () => presentation.attrs.onintroend as never,
				onexitend: () => presentation.attrs.onexitend as never,
				// Matches `html-element.svelte`, the renderer this path replaces.
				once: true
			})
		: undefined;

	/**
	 * One object per presentation, not per read. On the server that is one allocation per element —
	 * exactly what the leaf's own `class` + spread merge was already paying — and on the client it
	 * survives every render that does not change the presentation.
	 */
	const spread = !BROWSER
		? () => ({ class: withDefaultBorder(toClassValue(presentation.class)), ...presentation.attrs })
		: (() => {
				const memo = $derived({
					class: withDefaultBorder(toClassValue(presentation.class)),
					...presentation.attrs
				});
				return () => memo;
			})();

	// Returned as an object literal, NOT a class. A class was tried here to move the five methods
	// onto one shared prototype and drop five closure allocations per rendered part — allocation is
	// a real SSR cost, GC being ~13% of self time on a card page. Interleaved A/B against the same
	// base said otherwise: the win on `card` fell from −7.1% to −2.8% with the class in place. The
	// closures capture one context object and the calls stay monomorphic, where the class added a
	// prototype hop and a `this` load to getters the renderer calls several times per part. Measured
	// and reverted; do not "optimise" this back into a class without an A/B saying so.
	return {
		seam,
		mode(): RenderMode {
			// `base` and `oninit` are read off the config, since neither survives into the resolved
			// attrs; a preset-declared `base` arrives on the presentation instead.
			const config = props();
			const as = presentation.as;
			return renderMode({
				// The comparison, not the tag: `tag()` below builds the string for the branch that needs
				// it, and this predicate only ever asked whether it was `div`. Passing the string meant
				// every rendered element ran `String(as ?? 'div')` twice.
				isDiv: as === 'div' || as == null,
				// The other literal leaf. Same comparison-not-string reason as `isDiv` above: a literal
				// `<h3>` costs one hydration anchor where `<svelte:element this={'h3'}>` costs three,
				// and the class-only lane has always had this leaf.
				isHeading: as === 'h3',
				isButton: as === 'button',
				// The class-only leaf, by identity rather than by a walk — see `EMPTY_ATTRS`. The
				// resolved class cannot be empty on this lane (`withDefaultBorder` substitutes
				// `border-border`), so the `class=""` divergence the node lane has to guard against
				// cannot arise here.
				plain: presentation.attrs === EMPTY_ATTRS,
				motion: presentation.motion,
				attrs: presentation.attrs,
				base: config.base ?? presentation.base,
				// No rune, no leaf: a part whose motion appeared after init escalates as it always has.
				canLeafTransition: motion !== undefined
			});
		},
		tag: () => String(presentation.as ?? 'div'),
		class: () => withDefaultBorder(toClassValue(presentation.class)),
		attrs: () => presentation.attrs,
		spread: () => spread(),
		motion: () => motion,
		resolvedMotion: () => presentation.motion,
		renderer() {
			const target = resolveRenderTarget(presentation.base, HtmlElement);
			const rendererProps = resolveRendererProps(
				target,
				presentation.class,
				presentation.as,
				presentation.attrs,
				presentation.motion,
				{
					presentationResolved: target.kind === 'component' && target.component === HtmlElement
				}
			);
			// Kernel already owns lifecycle; never forward its private symbols into a renderer.
			for (const symbol of Object.getOwnPropertySymbols(rendererProps)) {
				if (isLifecycleKey(symbol)) delete rendererProps[symbol];
			}
			return {
				component: resolveRendererComponent(target, SnippetAdapter),
				props: rendererProps
			};
		}
	};
}
