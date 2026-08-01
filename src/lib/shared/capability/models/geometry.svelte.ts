import { defineCapability, sharedCapabilityKey, type Capability } from '../capability';

export interface GeometryRect {
	x: number;
	y: number;
	width: number;
	height: number;
	top: number;
	right: number;
	bottom: number;
	left: number;
}

export interface GeometryBacking {
	rect(key: string): GeometryRect | undefined;
	setRect?: (key: string, rect: GeometryRect | undefined) => void;
	keys?: () => readonly string[];
}

export interface GeometryModel {
	rect(key: string): GeometryRect | undefined;
	setRect(key: string, rect: GeometryRect | undefined): void;
	clear(key: string): void;
	keys(): readonly string[];
}

export interface GeometryProjectionContext {
	key?: string | undefined;
}

export const GEOMETRY = sharedCapabilityKey<GeometryModel>('@svelte-atoms/cap:geometry');

export function createGeometry(backing?: Partial<GeometryBacking>): GeometryModel {
	const rects = new Map<string, GeometryRect>();

	return {
		rect(key) {
			return backing?.rect?.(key) ?? rects.get(key);
		},
		setRect(key, rect) {
			if (backing?.setRect) {
				backing.setRect(key, rect);
				return;
			}
			if (rect) rects.set(key, rect);
			else rects.delete(key);
		},
		clear(key) {
			this.setRect(key, undefined);
		},
		keys() {
			return backing?.keys?.() ?? [...rects.keys()];
		}
	};
}

export interface GeometryProjectionOptions {
	roles?: readonly string[];
}

export function geometryCapability(
	geometry: GeometryModel,
	options: GeometryProjectionOptions = {}
): Capability<GeometryModel> {
	const roles = options.roles ?? ['control'];

	return defineCapability<GeometryModel>({
		slot: GEOMETRY,
		surface: geometry,
		meta: {
			layer: 1,
			kind: 'model',
			projects: roles,
			docs: 'Named element rectangles and measured geometry projection.'
		},
		behavior: (role, ctx) => {
			if (!roles.includes(role)) return undefined;
			const key = geometryKey(ctx);
			return {
				attrs: () => geometryAttrs(geometry, key)
			};
		}
	});
}

function geometryKey(ctx: unknown): string | undefined {
	if (typeof ctx === 'string') return ctx;
	if (ctx && typeof ctx === 'object' && 'key' in ctx) {
		const key = (ctx as GeometryProjectionContext).key;
		return typeof key === 'string' ? key : undefined;
	}
	return undefined;
}

function geometryAttrs(geometry: GeometryModel, key: string | undefined): Record<string, unknown> {
	const rect = key ? geometry.rect(key) : undefined;
	return {
		'data-geometry-key': key,
		'data-rect-x': rect?.x,
		'data-rect-y': rect?.y,
		'data-rect-width': rect?.width,
		'data-rect-height': rect?.height,
		'data-rect-top': rect?.top,
		'data-rect-right': rect?.right,
		'data-rect-bottom': rect?.bottom,
		'data-rect-left': rect?.left
	};
}
