export type TooltipArrowPathOptions = {
	/**
	 * Base width of the arrow.
	 * Example: 18-24px usually feels right for popovers.
	 */
	size?: number;

	/**
	 * Vertical depth of the arrow.
	 * Guarded against becoming too shallow or too spiky.
	 */
	depth?: number;

	/**
	 * Controls the inward side curvature / shoulder softness.
	 * Higher values make the arrow blend more organically into the popover.
	 */
	inwardCurve?: number;

	/**
	 * Horizontal width of the rounded tip area.
	 * Set to 0 for a sharp tip.
	 */
	tipSize?: number;

	/**
	 * Vertical softness of the tip.
	 * Only applies when tipSize > 0.
	 */
	tipCurve?: number;

	/** Decimal precision for the generated path. */
	precision?: number;
};

export type TooltipArrowPathResult = {
	d: string;
	width: number;
	height: number;
	viewBox: string;
	values: {
		size: number;
		depth: number;
		inwardCurve: number;
		tipSize: number;
		tipCurve: number;
	};
};

const clamp = (value: number, min: number, max: number) => {
	return Math.min(max, Math.max(min, value));
};

const numberOr = (value: unknown, fallback: number) => {
	return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
};

const positiveNumberOr = (value: unknown, fallback: number) => {
	const number = numberOr(value, fallback);
	return number > 0 ? number : fallback;
};

const cleanNumber = (value: number, precision: number) => {
	const rounded = Number(value.toFixed(precision));
	return Object.is(rounded, -0) ? 0 : rounded;
};

/**
 * Creates a downward popover/tooltip arrow path.
 *
 * Shape contract:
 * - Always symmetrical.
 * - Always starts and ends horizontally, so it blends into the popover body.
 * - Guards against self-intersections.
 * - Guards against needle-like or flattened arrows.
 */
export function createTooltipArrowPath(
	options: TooltipArrowPathOptions = {}
): TooltipArrowPathResult {
	const precision = clamp(Math.round(numberOr(options.precision, 3)), 0, 6);

	const n = (value: number) => String(cleanNumber(value, precision));
	const p = (x: number, y: number) => `${n(x)} ${n(y)}`;

	const width = clamp(positiveNumberOr(options.size, 20), 6, 4096);
	const height = clamp(positiveNumberOr(options.depth, width * 0.55), width * 0.25, width * 0.9);

	let tipSize = clamp(numberOr(options.tipSize, width * 0.2), 0, width * 0.42);
	let tipCurve =
		tipSize <= 0.001
			? 0
			: clamp(
					numberOr(options.tipCurve, height * 0.18),
					0,
					Math.min(height * 0.45, tipSize * 0.85)
				);

	if (tipSize <= 0.001 || tipCurve <= 0.001) {
		tipSize = 0;
		tipCurve = 0;
	}

	const centerX = width / 2;
	const tipHalf = tipSize / 2;
	const leftTipX = centerX - tipHalf;
	const rightTipX = centerX + tipHalf;
	const tipStartY = height - tipCurve;

	const maxInwardCurve = Math.min(leftTipX * 0.95, height * 0.75, width * 0.35);
	const inwardCurve = clamp(
		numberOr(options.inwardCurve, width * 0.25),
		0,
		Math.max(0, maxInwardCurve)
	);

	const c1x = clamp(inwardCurve * 0.85, 0, leftTipX * 0.55);
	const c2x = clamp(leftTipX - inwardCurve * 0.55, c1x, leftTipX);
	const c2y = clamp(tipStartY - inwardCurve * 0.16, 0, tipStartY);
	const tipHandleX = tipCurve > 0 ? Math.min(tipHalf * 0.7, tipCurve * 1.15) : 0;
	const tipHandleY = tipCurve * 0.72;

	const commands: string[] = [
		`M ${p(0, 0)}`,
		`C ${p(c1x, 0)} ${p(c2x, c2y)} ${p(leftTipX, tipStartY)}`
	];

	if (tipCurve > 0) {
		commands.push(
			`C ${p(leftTipX + tipHandleX, tipStartY + tipHandleY)} ${p(
				centerX - tipHandleX * 0.45,
				height
			)} ${p(centerX, height)}`,
			`C ${p(centerX + tipHandleX * 0.45, height)} ${p(
				rightTipX - tipHandleX,
				tipStartY + tipHandleY
			)} ${p(rightTipX, tipStartY)}`
		);
	}

	commands.push(`C ${p(width - c2x, c2y)} ${p(width - c1x, 0)} ${p(width, 0)}`, 'Z');

	return {
		d: commands.join(' '),
		width: cleanNumber(width, precision),
		height: cleanNumber(height, precision),
		viewBox: `0 0 ${n(width)} ${n(height)}`,
		values: {
			size: cleanNumber(width, precision),
			depth: cleanNumber(height, precision),
			inwardCurve: cleanNumber(inwardCurve, precision),
			tipSize: cleanNumber(tipSize, precision),
			tipCurve: cleanNumber(tipCurve, precision)
		}
	};
}
