import { defineCapability, sharedCapabilityKey, type Capability } from '../capability';

export interface ViewportSize {
	width: number;
	height: number;
}

export interface ViewportScroll {
	x: number;
	y: number;
}

export interface ViewportRange {
	start: number;
	end: number;
}

export interface ViewportBacking {
	size(): ViewportSize;
	scroll?: () => ViewportScroll;
	visibleRange?: () => ViewportRange | undefined;
}

export interface ViewportModel {
	readonly width: number;
	readonly height: number;
	readonly scrollX: number;
	readonly scrollY: number;
	readonly visibleRange: ViewportRange | undefined;
}

export const VIEWPORT = sharedCapabilityKey<ViewportModel>('@svelte-atoms/cap:viewport');

export function createViewport(backing: ViewportBacking): ViewportModel {
	return {
		get width() {
			return backing.size().width;
		},
		get height() {
			return backing.size().height;
		},
		get scrollX() {
			return backing.scroll?.().x ?? 0;
		},
		get scrollY() {
			return backing.scroll?.().y ?? 0;
		},
		get visibleRange() {
			return backing.visibleRange?.();
		}
	};
}

export interface ViewportProjectionOptions {
	roles?: readonly string[];
}

export function viewportCapability(
	viewport: ViewportModel,
	options: ViewportProjectionOptions = {}
): Capability<ViewportModel> {
	const roles = options.roles ?? ['container'];

	return defineCapability<ViewportModel>({
		slot: VIEWPORT,
		surface: viewport,
		meta: {
			layer: 1,
			kind: 'model',
			projects: roles,
			docs: 'Viewport size, scroll position, and visible range model.'
		},
		behavior: (role) =>
			roles.includes(role)
				? {
						attrs: () => ({
							'data-viewport-width': viewport.width,
							'data-viewport-height': viewport.height,
							'data-scroll-x': viewport.scrollX,
							'data-scroll-y': viewport.scrollY,
							'data-visible-start': viewport.visibleRange?.start,
							'data-visible-end': viewport.visibleRange?.end
						})
					}
				: undefined
	});
}
