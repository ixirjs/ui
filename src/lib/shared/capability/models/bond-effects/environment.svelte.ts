import {
	defineCapability,
	sharedCapabilityKey,
	type Capability
} from '$ixirjs/ui/shared/capability/capability';
import type { Bond } from '$ixirjs/ui/shared/bond';
import {
	listen,
	resolveDocument,
	type DocumentSource
} from '$ixirjs/ui/shared/capability/models/bond-effects/shared';

// Reactive media queries come from `svelte/reactivity` (`MediaQuery`) and `svelte/motion`
// (`prefersReducedMotion`) — see `src/lib/runes/index.ts`. No local re-implementation.

export const POINTER_MODALITY = sharedCapabilityKey<PointerModalitySurface>(
	'@ixirjs/cap:pointer-modality'
);

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
