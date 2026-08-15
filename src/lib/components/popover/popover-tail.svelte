<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import {
		mergeAtomProps,
		type Base,
		type BasePropsOf,
		type HtmlElementTagName
	} from '$ixirjs/ui/components/atom';
	import { createAtomInstance, type Atom } from '$ixirjs/ui/shared/bond';
	import { createPopoverAtom, PopoverBond } from './bond.svelte';
	import { popoverTailGeometry } from './presentation.svelte';
	import type { PopoverTailProps } from './types';

	const bond = PopoverBond.getOrThrow('<Popover.Tail /> must be used within a <Popover />');

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		padding = 0,
		size = 20,
		...restProps
	}: PopoverTailProps<E, B> & BasePropsOf<B> = $props();

	const atom = createAtomInstance<Atom<PopoverBond, HTMLElement>, PopoverBond, HTMLElement>(
		'tail',
		{
			bond,
			factory: (owner) => createPopoverAtom(owner as PopoverBond, 'tail'),
			capabilities: [popoverTailGeometry({ padding: () => padding, size: () => size })]
		}
	);

	const tailProps = $derived(mergeAtomProps(atom, preset, restProps, bond.presetLayer('tail')));

	const tailCross = $derived(readNumber(tailProps['data-tail-cross'], 28));
	const tailCap = $derived(readNumber(tailProps['data-tail-cap'], 10));
	const tailTip = $derived(readNumber(tailProps['data-tail-tip'], 10));
	const tailMain = $derived(readNumber(tailProps['data-tail-main'], tailCap + tailTip));
	const tailViewBox = $derived(`0 0 ${tailCross} ${tailMain}`);
	const tailPath = $derived(roundedCapTailPath(tailCross, tailCap, tailTip));

	function readNumber(value: unknown, fallback: number) {
		const number = Number(value);
		return Number.isFinite(number) && number > 0 ? number : fallback;
	}

	// The base band nearest the content (width `overlap`) is meant to be tucked out of sight,
	// not merely painted behind it: `z-[-1]` can't guarantee that once content picks up any
	// property that gives it its own stacking context (backdrop-filter, opacity<1, transform,
	// …) — a box's own background always paints before its descendants regardless of z-index.
	// Clipping the overlap band off outright works unconditionally, independent of tail color
	// or content's stacking context, since that band was never meant to be visible anyway.
	const tailOverlap = $derived(readNumber(tailProps['data-tail-overlap'], 0));
	const tailSide = $derived(tailProps['data-tail-side'] as string | undefined);
	const tailClipPath = $derived(overlapClipPath(tailSide, tailOverlap));

	function overlapClipPath(side: string | undefined, overlap: number) {
		if (!overlap) return undefined;
		switch (side) {
			case 'top':
				return `inset(${overlap}px 0 0 0)`;
			case 'bottom':
				return `inset(0 0 ${overlap}px 0)`;
			case 'left':
				return `inset(0 0 0 ${overlap}px)`;
			case 'right':
				return `inset(0 ${overlap}px 0 0)`;
			default:
				return undefined;
		}
	}

	const tailStyle = $derived(
		[tailProps.style, tailClipPath && `clip-path: ${tailClipPath}`].filter(Boolean).join('; ')
	);

	// Shape constants tuned against docs/architecture-review.md's tail tuner artifact.
	// BASE_FLARE: base-corner radius, fraction of cross width.
	// TIP_SIZE: tip-zone half-width (how broad the point is), fraction of cross width.
	// TIP_CURVE: 0 = sharp point, 1 = round dome.
	// CONCAVITY: inward bow of the flanks, fraction of flank length.
	// BALANCE: where along each flank the concave scoop peaks (0 = at the base, 1 = at the tip).
	const BASE_FLARE = 0.14;
	const TIP_SIZE = 0.02;
	const TIP_CURVE = 1.0;
	const CONCAVITY = 0.2;
	const BALANCE = 0.6;

	function roundedCapTailPath(cross: number, cap: number, tip: number) {
		const main = cap + tip;
		const center = cross / 2;
		// Guarded so the base-corner radius never exceeds the half-width: an extreme
		// cap/cross ratio (e.g. a very thin popover) would otherwise flip the flank
		// start past center and self-intersect the path.
		const radius = Math.min(cap / 2, cross * BASE_FLARE, center);
		// Guarded so the tip-zone half-width never pushes the flank end before the
		// flank start (`center - tipR >= radius`) — keeps the flanks a non-negative
		// span regardless of how small `cross`/`tip` are.
		const maxTipR = Math.max(0, center - radius);
		const tipR = Math.min(Math.max(0, cross * TIP_SIZE), center * 0.9, tip * 0.85, maxTipR);

		const flankStartLeft = radius;
		const flankEndLeft = center - tipR;
		const dx = flankEndLeft - flankStartLeft;
		const dy = tip - tipR;
		// Perpendicular-to-chord scoop, proportional to flank length.
		const offX = dy * CONCAVITY;
		const offY = dx * CONCAVITY;
		const c1x = flankStartLeft + dx * (1 - BALANCE) + offX;
		const c1y = tip - dy * (1 - BALANCE) + offY;
		const c2x = flankStartLeft + dx * BALANCE + offX;
		const c2y = tip - dy * BALANCE + offY;

		const apexCtrl = tipR * TIP_CURVE;

		return [
			`M0 ${main}`,
			`V${tip + radius}`,
			`Q0 ${tip} ${radius} ${tip}`,
			`C${c1x} ${c1y} ${c2x} ${c2y} ${flankEndLeft} ${tipR}`,
			`Q${center - apexCtrl} 0 ${center} 0`,
			`Q${center + apexCtrl} 0 ${center + tipR} ${tipR}`,
			`C${cross - c2x} ${c2y} ${cross - c1x} ${c1y} ${cross - radius} ${tip}`,
			`Q${cross} ${tip} ${cross} ${tip + radius}`,
			`V${main}`,
			'Z'
		].join(' ');
	}

	// The merged props already fold the Atom spread; build Kernel once during initialization.
	const bodyArg = { popover: bond };
	const el = Kernel.element(
		{ atom: undefined, bond, preset: undefined, presetLayer: undefined },
		() => ({
			bond,
			class: [
				'sa-popover-tail text-popover border-border pointer-events-none absolute z-[-1]',
				'$preset',
				klass
			],
			...tailProps,
			style: tailStyle
		})
	);
</script>

{@render Kernel.render(el)(
	el.tag(),
	el.class(),
	el.attrs(),
	children ?? fallback,
	bodyArg,
	el.motion(),
	el
)}

{#snippet fallback()}
	<svg
		class=""
		width={tailCross}
		height={tailMain}
		viewBox={tailViewBox}
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		style="position: absolute; top: 50%; left: 50%; display: block; transform: translate(-50%, -50%) var(--sa-popover-tail-transform); transform-origin: center;"
	>
		<path d={tailPath} fill="var(--sa-popover-tail-fill, currentColor)" />
	</svg>
{/snippet}
