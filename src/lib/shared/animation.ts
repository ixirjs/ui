import { prefersReducedMotion } from '$ixirjs/ui/utils/dom.svelte';

export type Easing = string | readonly [number, number, number, number];

export type AnimationValue = string | number;
export type AnimationKeyframeValue = AnimationValue | readonly AnimationValue[];
export type AnimationKeyframes = Record<string, AnimationKeyframeValue | undefined>;

export type AnimationOptions = {
	// seconds
	duration?: number;
	// seconds
	delay?: number;
	ease?: Easing | readonly Easing[];
	easing?: Easing;
	// Compatibility with the old motion recipes: WAAPI cannot run physics springs, so
	// `type: 'spring'` maps stiffness/damping to spring-like duration/easing.
	type?: 'spring';
	stiffness?: number;
	damping?: number;
	onComplete?: () => void;
};

export type AnimationController = {
	finished: Promise<void>;
	stop(): void;
};

const TRANSFORM_PROPS = new Set([
	'x',
	'y',
	'translateX',
	'translateY',
	'scale',
	'scaleX',
	'scaleY',
	'rotate'
]);

const NON_ANIMATABLE_PROPS = new Set([
	'pointerEvents',
	'display',
	'position',
	'top',
	'right',
	'bottom',
	'left'
]);
const DIMENSION_PROPS = new Set([
	'top',
	'right',
	'bottom',
	'left',
	'width',
	'height',
	'min-width',
	'min-height',
	'max-width',
	'max-height',
	'minWidth',
	'minHeight',
	'maxWidth',
	'maxHeight'
]);

const ZERO_CONTROLLER: AnimationController = {
	finished: Promise.resolve(),
	stop() {}
};

// Tiny WAAPI-backed animation helper used by component recipes. Durations are seconds to
// match the old motion factories; Svelte transitions still use milliseconds.
export function animate(
	node: HTMLElement,
	input: AnimationKeyframes,
	options: AnimationOptions = {}
): AnimationController {
	const normalized = normalizeKeyframes(node, input);
	const reducedMotion = prefersReducedMotion();
	const timing = resolveTiming(options);
	const duration = reducedMotion ? 0 : timing.duration;
	const delay = reducedMotion ? 0 : secondsToMs(options.delay ?? 0);

	if (!node.animate || duration === 0) {
		applyFinalStyles(node, normalized.finalStyles);
		options.onComplete?.();
		return ZERO_CONTROLLER;
	}

	const keyframes = normalized.keyframes;
	if (!Object.keys(keyframes).length) {
		applyFinalStyles(node, normalized.finalStyles);
		options.onComplete?.();
		return ZERO_CONTROLLER;
	}

	const animation = node.animate(keyframes, {
		duration,
		delay,
		easing: timing.easing,
		fill: 'both'
	});

	let stopped = false;
	let released = false;
	const releaseFill = () => {
		if (released) return;
		released = true;
		animation.cancel();
	};
	const finished = animation.finished
		.then(() => {
			if (stopped) return;
			applyFinalStyles(node, normalized.finalStyles);
			// Release WAAPI's fill layer after committing inline final styles. A filled
			// height animation keeps the last measured pixel height in the compositor,
			// which prevents open containers from resizing when nested content expands.
			releaseFill();
			options.onComplete?.();
		})
		.catch(() => undefined);

	return {
		finished,
		stop() {
			stopped = true;
			releaseFill();
		}
	};
}

type NormalizedKeyframes = {
	keyframes: Record<string, string[]>;
	finalStyles: Record<string, string>;
};

function normalizeKeyframes(node: HTMLElement, input: AnimationKeyframes): NormalizedKeyframes {
	const keyframes: Record<string, string[]> = {};
	const finalStyles: Record<string, string> = {};
	const transformInputs: Record<string, AnimationKeyframeValue> = {};
	const immediate: Record<string, string> = {};

	for (const prop in input) {
		if (!Object.hasOwn(input, prop)) continue;
		const value = input[prop];
		if (value === undefined) continue;

		if (TRANSFORM_PROPS.has(prop)) {
			transformInputs[prop] = value;
			continue;
		}

		const normalized = normalizePropertyValues(node, prop, value);
		if (NON_ANIMATABLE_PROPS.has(prop)) {
			immediate[prop] = normalized.finalValue;
			continue;
		}

		keyframes[toAnimationProperty(prop)] = normalized.values;
		finalStyles[prop] = normalized.finalStyleValue;
	}

	const transform = normalizeTransformValues(node, transformInputs);
	if (transform) {
		keyframes.transform = transform.values;
		finalStyles.transform = transform.finalValue;
	}

	Object.assign(finalStyles, immediate);
	return { keyframes, finalStyles };
}

function normalizePropertyValues(
	node: HTMLElement,
	prop: string,
	value: AnimationKeyframeValue
): { values: string[]; finalValue: string; finalStyleValue: string } {
	const rawValues = isArrayValue(value) ? [...value] : [currentStyle(node, prop), value];
	const values = rawValues.map((item) => normalizeCssValue(node, prop, item));
	const finalStyleValue = normalizeFinalCssValue(prop, rawValues[rawValues.length - 1]!);
	return { values, finalValue: values[values.length - 1] ?? '', finalStyleValue };
}

function normalizeTransformValues(
	node: HTMLElement,
	input: Record<string, AnimationKeyframeValue>
): { values: string[]; finalValue: string } | undefined {
	const entries = Object.entries(input);
	if (!entries.length) return undefined;

	const props = new Map<string, Array<string | undefined>>();
	let length = 2;
	for (const [prop, value] of entries) {
		const values = isArrayValue(value)
			? value.map((item) => normalizeTransformValue(prop, item))
			: [undefined, normalizeTransformValue(prop, value)];
		props.set(prop, values);
		length = Math.max(length, values.length);
	}

	const current = currentTransform(node);
	const values: string[] = [];
	for (let i = 0; i < length; i++) {
		if (i === 0 && entries.every(([prop]) => props.get(prop)?.[0] === undefined)) {
			values.push(current);
			continue;
		}
		values.push(buildTransform(props, i));
	}

	return { values, finalValue: values[values.length - 1] ?? '' };
}

function buildTransform(props: Map<string, Array<string | undefined>>, index: number): string {
	const value = (prop: string, fallback: string) => {
		const values = props.get(prop);
		if (!values) return fallback;
		return values[Math.min(index, values.length - 1)] ?? fallback;
	};

	const x = value('translateX', value('x', '0px'));
	const y = value('translateY', value('y', '0px'));
	const scale = value('scale', '');
	const scaleX = value('scaleX', '');
	const scaleY = value('scaleY', '');
	const rotate = value('rotate', '');
	const parts: string[] = [];

	if (x !== '0px' || y !== '0px') parts.push(`translate(${x}, ${y})`);
	if (scale) parts.push(`scale(${scale})`);
	if (scaleX) parts.push(`scaleX(${scaleX})`);
	if (scaleY) parts.push(`scaleY(${scaleY})`);
	if (rotate) parts.push(`rotate(${rotate})`);

	return parts.join(' ') || 'none';
}

function isArrayValue(value: AnimationKeyframeValue): value is readonly AnimationValue[] {
	return Array.isArray(value);
}

function applyFinalStyles(node: HTMLElement, styles: Record<string, string>): void {
	for (const [prop, value] of Object.entries(styles)) {
		if (prop === 'transform') {
			node.style.transform = value === 'none' ? '' : value;
			continue;
		}
		node.style.setProperty(toCssProperty(prop), value);
	}
}

function normalizeCssValue(node: HTMLElement, prop: string, value: AnimationValue): string {
	if (value === 'auto') return measuredAutoValue(node, prop);
	if (typeof value === 'number' && DIMENSION_PROPS.has(prop)) return `${value}px`;
	return String(value);
}

function normalizeFinalCssValue(prop: string, value: AnimationValue): string {
	if (typeof value === 'number' && DIMENSION_PROPS.has(prop)) return `${value}px`;
	return String(value);
}

function normalizeTransformValue(prop: string, value: AnimationValue): string {
	if (typeof value !== 'number') return value;
	if (prop === 'scale' || prop === 'scaleX' || prop === 'scaleY') return String(value);
	if (prop === 'rotate') return `${value}deg`;
	return `${value}px`;
}

function measuredAutoValue(node: HTMLElement, prop: string): string {
	if (isWidthProperty(prop)) {
		const previous = node.style.width;
		node.style.width = 'auto';
		const width = node.scrollWidth || node.getBoundingClientRect().width;
		node.style.width = previous;
		return `${width}px`;
	}

	const previous = node.style.height;
	node.style.height = 'auto';
	const height = node.scrollHeight || node.getBoundingClientRect().height;
	node.style.height = previous;
	return `${height}px`;
}

function currentStyle(node: HTMLElement, prop: string): string {
	return getComputedStyle(node).getPropertyValue(toCssProperty(prop)) || '';
}

function currentTransform(node: HTMLElement): string {
	const transform = node.style.transform || getComputedStyle(node).transform;
	return !transform || transform === 'none' ? 'none' : transform;
}

function isWidthProperty(prop: string): boolean {
	return prop === 'width' || prop === 'min-width' || prop === 'max-width' || prop.endsWith('Width');
}

function toAnimationProperty(prop: string): string {
	return prop.includes('-')
		? prop.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
		: prop;
}

function toCssProperty(prop: string): string {
	return prop.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function resolveTiming(options: AnimationOptions): { duration: number; easing: string } {
	if (options.type === 'spring') {
		return {
			duration: secondsToMs(options.duration ?? springDuration(options.stiffness, options.damping)),
			easing: resolveEasing(options.ease ?? options.easing ?? springEasing(options.damping))
		};
	}

	return {
		duration: secondsToMs(options.duration ?? 0),
		easing: resolveEasing(options.ease ?? options.easing)
	};
}

function springDuration(stiffness = 300, damping = 30): number {
	const stiffnessFactor = Math.sqrt(300 / clamp(1, 1000, stiffness));
	const dampingFactor = Math.sqrt(clamp(1, 80, damping) / 30);
	return clamp(0.18, 0.65, 0.3 * stiffnessFactor * dampingFactor);
}

function springEasing(damping = 30): Easing {
	if (damping < 24) return 'cubic-bezier(0.34, 1.56, 0.64, 1)';
	if (damping > 40) return 'cubic-bezier(0.22, 1, 0.36, 1)';
	return 'cubic-bezier(0.16, 1, 0.3, 1)';
}

function clamp(min: number, max: number, value: number): number {
	return Math.min(max, Math.max(min, value));
}

function secondsToMs(seconds: number): number {
	return Math.max(0, seconds * 1000);
}

function resolveEasing(ease: Easing | readonly Easing[] | undefined): string {
	const value = Array.isArray(ease) && typeof ease[0] !== 'number' ? ease[0] : ease;
	if (!value) return 'linear';
	if (Array.isArray(value)) return `cubic-bezier(${value.join(', ')})`;

	switch (value) {
		case 'easeInOut':
			return 'ease-in-out';
		case 'easeIn':
			return 'ease-in';
		case 'easeOut':
			return 'ease-out';
		case 'circOut':
			return 'cubic-bezier(0, 0.55, 0.45, 1)';
		case 'anticipate':
			return 'cubic-bezier(0.68, -0.6, 0.32, 1.6)';
		default:
			return value;
	}
}
