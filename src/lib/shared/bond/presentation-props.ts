import { DEV } from 'esm-env';
import type { PresetKey, PresetLike } from '$ixirjs/ui/preset/types';
import { mergeSpreadProps } from './merge';

export type PresentableAtom =
	| {
			preset?: string;
			spread?: Record<string | symbol, unknown>;
			presentationSpread?: Record<string | symbol, unknown>;
			bindId?: (source: () => string | undefined) => void;
	  }
	| undefined;

// `source`/`nextSource` label conflict diagnostics, which `warnConflict` emits only under DEV.
// Naming the layer therefore costs a template literal per rendered part in production for a string
// nothing can read. `nextIsUser` is the one field that changes merge behaviour, so the shipped
// path passes this shared frozen object and allocates nothing.
const MERGE_ATOM_LAYER = Object.freeze({ nextIsUser: true });

// The no-consumer-id binding, shared: every part without an `id` prop — the overwhelming case —
// used to allocate a fresh closure per merge just to answer `undefined`. Binding the shared thunk
// still clears a stale prior binding when a consumer id is later removed.
const NO_CONSUMER_ID = () => undefined;

// Native presentation hosts need the Atom merge without tunnelling the preset selector into attrs.
export function mergeAtomPresentationProps(
	atom: PresentableAtom,
	restProps: Record<string, unknown>
): Record<string | symbol, unknown> {
	atom?.bindId?.(
		restProps.id === undefined
			? NO_CONSUMER_ID
			: () => (typeof restProps.id === 'string' ? restProps.id : undefined)
	);
	return mergeSpreadProps(
		atom?.presentationSpread ?? atom?.spread,
		stripDefaultLayerProps(restProps),
		DEV
			? {
					source: atom?.preset ? `atom preset "${atom.preset}"` : 'atom spread',
					nextSource: 'component props',
					nextIsUser: true
				}
			: MERGE_ATOM_LAYER
	);
}

export function mergeAtomProps(
	atom: PresentableAtom,
	preset: unknown,
	restProps: Record<string, unknown>,
	presetLayer?: PresetLike
): Record<string, unknown> & {
	preset: PresetKey | undefined;
	presetLayer?: PresetLike | undefined;
} {
	const layer = presetLayer ?? (restProps.presetLayer as PresetLike | undefined);
	const props = {
		preset: (preset ?? atom?.preset) as PresetKey | undefined,
		...mergeAtomPresentationProps(atom, restProps)
	};
	return layer === undefined ? props : { ...props, presetLayer: layer };
}

export function mergePresetProps(
	preset: unknown,
	defaultPreset: PresetKey,
	restProps: Record<string, unknown>
): Record<string, unknown> & { preset: PresetKey } {
	return {
		preset: (preset ?? defaultPreset) as PresetKey,
		...stripDefaultLayerProps(restProps)
	};
}

// `defaults` is Kernel's internal low-priority presentation layer, never an ordinary DOM prop.
function stripDefaultLayerProps(
	restProps: Record<string, unknown>
): Record<string | symbol, unknown> {
	if (!Object.hasOwn(restProps, 'defaults')) {
		return restProps as Record<string | symbol, unknown>;
	}

	const out: Record<string | symbol, unknown> = {};
	for (const key in restProps) {
		if (!Object.hasOwn(restProps, key) || key === 'defaults') continue;
		out[key] = restProps[key];
	}
	const symbolProps = restProps as Record<string | symbol, unknown>;
	for (const key of Object.getOwnPropertySymbols(restProps)) out[key] = symbolProps[key];
	return out;
}
