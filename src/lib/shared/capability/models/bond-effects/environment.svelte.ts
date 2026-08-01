import {
	defineCapability,
	sharedCapabilityKey,
	type Capability
} from '$ixirjs/ui/shared/capability/capability';
import type { Bond } from '$ixirjs/ui/shared/bond';
import {
	listen,
	resolveDocument,
	resolveWindow,
	type DocumentSource,
	type WindowSource
} from '$ixirjs/ui/shared/capability/models/bond-effects/shared';

export const MEDIA_QUERY = sharedCapabilityKey<MediaQuerySurface>({
	owner: '@ixirjs/cap',
	name: 'media-query',
	version: 1
});
export const REDUCED_MOTION = sharedCapabilityKey<MediaQuerySurface>({
	owner: '@ixirjs/cap',
	name: 'reduced-motion',
	version: 1
});
export const POINTER_MODALITY = sharedCapabilityKey<PointerModalitySurface>({
	owner: '@ixirjs/cap',
	name: 'pointer-modality',
	version: 1
});

export interface MediaQueryCapabilityOptions {
	query: string;
	window?: WindowSource;
	onChange?: (matches: boolean, event: MediaQueryListEvent | MediaQueryList, bond: Bond) => void;
}

export interface MediaQuerySurface {
	readonly query: string;
	readonly matches: boolean;
}

export function mediaQueryCapability(
	options: string | MediaQueryCapabilityOptions
): Capability<MediaQuerySurface> {
	const config = typeof options === 'string' ? { query: options } : options;
	let matches = $state(false);
	const surface: MediaQuerySurface = {
		query: config.query,
		get matches() {
			return matches;
		}
	};

	return defineCapability<MediaQuerySurface>({
		slot: MEDIA_QUERY,
		surface,
		meta: {
			docs: 'Subscribes to a media query and exposes its current match state.'
		},
		setup: (bond) => {
			$effect(() =>
				setupMediaQuery(config, surface, (next, event) => {
					matches = next;
					config.onChange?.(next, event, bond);
				})
			);
		}
	});
}

export interface ReducedMotionCapabilityOptions {
	window?: WindowSource;
	onChange?: (matches: boolean, event: MediaQueryListEvent | MediaQueryList, bond: Bond) => void;
}

export function reducedMotionCapability(
	options: ReducedMotionCapabilityOptions = {}
): Capability<MediaQuerySurface> {
	let matches = $state(false);
	const query = '(prefers-reduced-motion: reduce)';
	const surface: MediaQuerySurface = {
		query,
		get matches() {
			return matches;
		}
	};

	return defineCapability<MediaQuerySurface>({
		slot: REDUCED_MOTION,
		surface,
		meta: {
			docs: 'Subscribes to prefers-reduced-motion and exposes the current match state.'
		},
		setup: (bond) => {
			$effect(() =>
				setupMediaQuery({ ...options, query }, surface, (next, event) => {
					matches = next;
					options.onChange?.(next, event, bond);
				})
			);
		}
	});
}

export type PointerModality = 'keyboard' | 'pointer' | 'virtual';

export interface PointerModalityCapabilityOptions {
	document?: DocumentSource;
	initial?: PointerModality;
	onChange?: (modality: PointerModality, bond: Bond, event: Event) => void;
}

export interface PointerModalitySurface {
	readonly modality: PointerModality;
	readonly pointerType: string | undefined;
}

export function pointerModalityCapability(
	options: PointerModalityCapabilityOptions = {}
): Capability<PointerModalitySurface> {
	let modality = $state<PointerModality>(options.initial ?? 'virtual');
	let pointerType = $state<string | undefined>();
	const surface: PointerModalitySurface = {
		get modality() {
			return modality;
		},
		get pointerType() {
			return pointerType;
		}
	};

	return defineCapability<PointerModalitySurface>({
		slot: POINTER_MODALITY,
		surface,
		meta: {
			docs: 'Tracks whether keyboard or pointer interaction is the current input modality.'
		},
		setup: (bond) => {
			$effect(() => {
				const doc = resolveDocument(options.document);
				if (!doc) return;
				const set = (next: PointerModality, event: Event, nextPointerType?: string) => {
					modality = next;
					pointerType = nextPointerType;
					options.onChange?.(next, bond, event);
				};
				const offPointer = listen(doc, 'pointerdown', (event) => {
					const pointer = event as PointerEvent;
					set('pointer', pointer, pointer.pointerType);
				});
				const offKey = listen(doc, 'keydown', (event) => {
					set('keyboard', event);
				});
				return () => {
					offPointer();
					offKey();
				};
			});
		}
	});
}

function setupMediaQuery(
	options: MediaQueryCapabilityOptions,
	surface: MediaQuerySurface,
	set: (matches: boolean, event: MediaQueryListEvent | MediaQueryList) => void
): void | (() => void) {
	const win = resolveWindow(options.window);
	if (!win?.matchMedia) return;
	const query = win.matchMedia(surface.query);
	set(query.matches, query);
	const listener = (event: MediaQueryListEvent) => set(event.matches, event);
	if (query.addEventListener) query.addEventListener('change', listener);
	else query.addListener?.(listener);
	return () => {
		if (query.removeEventListener) query.removeEventListener('change', listener);
		else query.removeListener?.(listener);
	};
}
