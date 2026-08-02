import { BROWSER } from 'esm-env';
import type { ClassValue } from 'svelte/elements';
import type { Bond } from '$ixirjs/ui/shared/bond';
import type { PresetKey, PresetLike } from '$ixirjs/ui/preset';
import {
	mergeAtomPresentationProps,
	type PresentableAtom
} from '$ixirjs/ui/shared/bond/presentation-props';
import { RootBond } from '$ixirjs/ui/components/root';
import { toClassValue } from '$ixirjs/ui/utils';
import { withDefaultBorder } from '$ixirjs/ui/components/element/class';
import { createPresentation } from './presentation.svelte';
import { getLifecycleProps } from './render/lifecycle.svelte';

/**
 * Library-internal element seam: render a part's element without the HtmlAtom component boundary.
 *
 * A bonded part used to be two Svelte components per element — the part itself plus HtmlAtom —
 * and the second boundary (renderer traversal, spread_props, context scope, ondestroy collection)
 * was ~a quarter of SSR cost while contributing nothing on the overwhelmingly common path. This
 * helper runs HtmlAtom's `<script>` work inside the part's own init, and the `partElement` snippet
 * (see part-element.svelte) renders the element directly — a snippet call, not a component.
 *
 * **The config IS an HtmlAtom props object.** One thunk returning one object, shaped exactly like
 * the `<HtmlAtom …>` call it replaces:
 *
 * ```ts
 * const el = usePartElement(part, () => ({
 *   as,
 *   class: ['card-title …', '$preset', klass],
 *   ...restProps
 * }));
 * ```
 *
 * Keys in {@link NAMED_PROPS} are HtmlAtom's own named props and are interpreted; everything else
 * is an element attribute. Precedence is therefore ordinary object-literal order — write the props
 * in the order the markup had them and the outcome is unchanged, with no rule to remember about
 * which axis beats which.
 *
 * The rich path is not reimplemented: anything HtmlAtom treats specially — `motion`, `oninit`,
 * `base`, `variants`, symbol lifecycle callbacks, preset-declared motion or renderer — routes the
 * part to the real `<HtmlAtom>` with the same props object, so HtmlAtom remains the single
 * lifecycle handler and the behavior contract has exactly one owner. Deliberately NOT exported
 * from the atom barrel: this is an authoring internal, not public API.
 */
export type PartElementSeam = {
	readonly atom: PresentableAtom;
	readonly bond: Bond | undefined;
	readonly preset: PresetKey | undefined;
	readonly presetLayer: PresetLike | undefined;
};

/**
 * HtmlAtom's named props. Everything a part returns outside this set is an element attribute.
 * Mirrors `html-atom.svelte`'s own destructure — the two must not drift.
 */
const NAMED_PROPS: ReadonlySet<string> = new Set([
	'class',
	'as',
	'base',
	'variants',
	'variantProps',
	'defaults',
	'motion',
	'oninit',
	'preset',
	'presetLayer',
	'bond',
	'atom',
	'part',
	'children'
]);

/**
 * The props a part hands the seam: HtmlAtom's named props plus arbitrary element attributes.
 *
 * Left as the bare index signature rather than restating HtmlAtom's named keys. Parts build this
 * by spreading their own `restProps`, whose element-prop types are wider than any hand-written
 * optional (`class` alone is `ClassValue | ClassValue[]`), and under `exactOptionalPropertyTypes`
 * a narrower declaration here rejects every call site while checking nothing HtmlAtom does not
 * already check downstream.
 */
export type PartElementProps = Record<string | symbol, unknown>;

export type PartElementConfig = () => PartElementProps;

export type PartElement = {
	/** The part/root seam handle, for the rich fallback and for callers needing bond/atom. */
	readonly seam: PartElementSeam;
	/** True when the plain `<svelte:element>` path carries this part (the common case). */
	native(): boolean;
	tag(): string;
	class(): string;
	attrs(): Record<string | symbol, unknown>;
	/** Rich-path props: the same packet HtmlAtom would have received from the part. */
	richProps(): Record<string | symbol, unknown>;
};

/** Element attributes only — the named props are consumed by the presentation axes above. */
function elementAttrs(source: PartElementProps): Record<string, unknown> {
	const rest: Record<string, unknown> = {};
	for (const key in source) {
		if (!Object.hasOwn(source, key) || NAMED_PROPS.has(key)) continue;
		rest[key] = source[key];
	}
	// `part` is the seam handle only when it is an object; a string is the CSS shadow-part
	// attribute and must reach the element — the same discrimination HtmlAtom applies.
	if (typeof source.part === 'string') rest.part = source.part;
	// Attachment keys and lifecycle callbacks ride symbol keys and must survive the split.
	const symbolSource = source as Record<string | symbol, unknown>;
	for (const symbol of Object.getOwnPropertySymbols(source)) {
		rest[symbol as unknown as string] = symbolSource[symbol];
	}
	return rest;
}

export function usePartElement(seam: PartElementSeam, config: PartElementConfig): PartElement {
	// Same init-scoped read HtmlAtom performs: a Root may override the default renderer.
	const rootBond = RootBond.get();

	// Server fast path: a server render is a single pass with no invalidations, so the config can
	// only ever be evaluated once — the two `$derived` below and their `once()` wrappers are pure
	// overhead there. The presentation seam already resolves eagerly server-side for the same
	// reason (see createPresentation's server branch).
	if (!BROWSER) {
		const props = config();
		const attrs = elementAttrs(props);
		return buildPartElement(
			seam,
			rootBond,
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
	return buildPartElement(
		seam,
		rootBond,
		() => props,
		() => elementAttrs(props)
	);
}

/** The Root shape `native()` consults; structural so both passes share one builder. */
type PartElementRoot = { props?: { renderers?: { html?: unknown } } } | undefined;

function buildPartElement(
	seam: PartElementSeam,
	rootBond: PartElementRoot,
	props: () => PartElementProps,
	attrs: () => Record<string, unknown>
): PartElement {
	const presentation = createPresentation({
		// Explicit props win over the seam, exactly as they do on HtmlAtom.
		preset: () => (props().preset as PresetKey | undefined) ?? seam.preset,
		bond: () => (props().bond as Bond | undefined) ?? seam.bond,
		instance: () => (props().presetLayer as PresetLike | undefined) ?? seam.presetLayer,
		class: () => props().class as ClassValue,
		as: () => props().as,
		base: () => props().base,
		variants: () => props().variants as never,
		// Bond state props ride this axis to select preset variants without leaking onto the DOM
		// as attributes — roots pass `variantProps: root.props` instead of spreading `...root.props`.
		variantProps: () => props().variantProps as Record<string, unknown> | undefined,
		defaults: () => props().defaults as Record<string, unknown> | undefined,
		motion: () => props().motion as never,
		restProps: () => {
			// Atom-less seam (static leaves like DataGrid.Cell): nothing to merge — forward the
			// element attrs by reference, exactly as HtmlAtom's atom-less branch forwards restProps.
			const atom = (props().atom as PresentableAtom) ?? seam.atom;
			return atom ? mergeAtomPresentationProps(atom, attrs()) : attrs();
		}
	});

	// Symbol lifecycle callbacks are classified once at init — that is their documented contract
	// (see runLifecycle). Presence routes the part through HtmlAtom so lifecycle handling keeps a
	// single owner and can never double-fire. Classification reads the shared props evaluation, so
	// it costs no second config() call on either pass — the old shape re-evaluated the thunk here,
	// allocating one extra props object per rendered part.
	const initLifecycle = getLifecycleProps(props() as Record<PropertyKey, unknown>);
	const hasLifecycleCallbacks = initLifecycle.mount.length > 0 || initLifecycle.destroy.length > 0;

	return {
		seam,
		native(): boolean {
			if (hasLifecycleCallbacks) return false;
			if (rootBond?.props?.renderers?.html) return false;
			// `base` selects a renderer component or snippet; `oninit` is HtmlAtom's init hook.
			// Both are read off the config, since neither survives into the resolved attrs.
			const config = props();
			if (config.base !== undefined || config.oninit !== undefined) return false;
			if (presentation.base !== undefined) return false;
			// Emptiness by early exit — same shape as HtmlAtom's check.
			for (const _ in presentation.motion) return false;
			const resolved = presentation.attrs;
			return !(
				'onmount' in resolved ||
				'ondestroy' in resolved ||
				'onintroend' in resolved ||
				'onexitend' in resolved ||
				'global' in resolved
			);
		},
		tag: () => String(presentation.as ?? 'div'),
		class: () => withDefaultBorder(toClassValue(presentation.class)),
		attrs: () => presentation.attrs,
		richProps() {
			// Cold path by construction. The part's own object already IS HtmlAtom's prop shape, so
			// it forwards as-is; only the seam handle is added, and explicit keys still win over it.
			return { part: seam, ...props() };
		}
	};
}
