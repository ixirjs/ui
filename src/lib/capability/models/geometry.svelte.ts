import { SvelteMap } from 'svelte/reactivity';
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

export function createGeometry(backing?: Partial<GeometryBacking>): GeometryModel {
	const rects = new SvelteMap<string, GeometryRect>();

	return {
		rect(key) {
			return backing?.rect?.(key) ?? rects.get(key);
		},
		setRect(key, rect) {
			// Keep a local mirror even with a partial backing: `rect` and `setRect` are
			// independently optional extension seams.
			if (rect) rects.set(key, rect);
			else rects.delete(key);
			backing?.setRect?.(key, rect);
		},
		clear(key) {
			this.setRect(key, undefined);
		},
		keys() {
			return [...new Set([...(backing?.keys?.() ?? []), ...rects.keys()])];
		}
	};
}
