import {
	defineCapability,
	sharedCapabilityKey,
	type Capability
} from '$ixirjs/ui/shared/capability/capability';
import type { Bond } from '$ixirjs/ui/shared/bond';
import {
	isNode,
	listen,
	noop,
	resolveDocument,
	type DocumentSource
} from '$ixirjs/ui/shared/capability/models/bond-effects/shared';

export const DOCUMENT_DRAG = sharedCapabilityKey<DocumentDragSurface>('@ixirjs/cap:document-drag');

export interface DocumentDragDetail {
	start: PointerEvent;
	current: PointerEvent;
	deltaX: number;
	deltaY: number;
}

export interface DocumentDragCallbacks {
	move?: (detail: DocumentDragDetail, bond: Bond) => void;
	end?: (detail: DocumentDragDetail, bond: Bond) => void;
}

export interface DocumentDragCapabilityOptions {
	document?: DocumentSource;
	onMove?: (detail: DocumentDragDetail, bond: Bond) => void;
	onEnd?: (detail: DocumentDragDetail, bond: Bond) => void;
}

export interface DocumentDragSurface {
	readonly active: boolean;
	start(event: PointerEvent, callbacks?: DocumentDragCallbacks): void;
	cancel(): void;
}

export function documentDragCapability(
	options: DocumentDragCapabilityOptions = {}
): Capability<DocumentDragSurface> {
	let bondRef: Bond | undefined;
	let active = $state(false);
	let cleanup = noop;
	let startEvent: PointerEvent | undefined;
	let pointerId: number | undefined;
	const surface: DocumentDragSurface = {
		get active() {
			return active;
		},
		start(event, callbacks = {}) {
			if (!bondRef) return;
			const currentTarget = event.currentTarget;
			const doc = options.document
				? resolveDocument(options.document)
				: isNode(currentTarget)
					? currentTarget.ownerDocument
					: resolveDocument(undefined);
			if (!doc) return;
			surface.cancel();
			startEvent = event;
			pointerId = event.pointerId;
			active = true;
			const move = (next: Event) => {
				if (!startEvent || !bondRef) return;
				const pointer = next as PointerEvent;
				if (pointer.pointerId !== pointerId) return;
				const detail = dragDetail(startEvent, pointer);
				options.onMove?.(detail, bondRef);
				callbacks.move?.(detail, bondRef);
			};
			const end = (next: Event) => {
				if (!startEvent || !bondRef) return;
				const pointer = next as PointerEvent;
				if (pointer.pointerId !== pointerId) return;
				const detail = dragDetail(startEvent, pointer);
				options.onEnd?.(detail, bondRef);
				callbacks.end?.(detail, bondRef);
				surface.cancel();
			};
			const cancel = (next: Event) => {
				if ((next as PointerEvent).pointerId === pointerId) surface.cancel();
			};
			const offMove = listen(doc, 'pointermove', move);
			const offUp = listen(doc, 'pointerup', end);
			const offCancel = listen(doc, 'pointercancel', cancel);
			cleanup = () => {
				offCancel();
				offUp();
				offMove();
			};
		},
		cancel() {
			cleanup();
			cleanup = noop;
			startEvent = undefined;
			pointerId = undefined;
			active = false;
		}
	};

	return defineCapability<DocumentDragSurface>({
		slot: DOCUMENT_DRAG,
		surface,
		meta: {
			docs: 'Provides document-level pointer move/up handling for drag interactions.'
		},
		setup: (bond) => {
			bondRef = bond;
			return () => {
				surface.cancel();
				bondRef = undefined;
			};
		}
	});
}

function dragDetail(start: PointerEvent, current: PointerEvent): DocumentDragDetail {
	return {
		start,
		current,
		deltaX: current.clientX - start.clientX,
		deltaY: current.clientY - start.clientY
	};
}
