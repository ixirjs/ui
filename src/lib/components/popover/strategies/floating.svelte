<script lang="ts">
	import {
		autoUpdate,
		computePosition,
		arrow,
		flip,
		shift,
		offset,
		hide,
		type ComputePositionConfig,
		type Strategy
	} from '@floating-ui/dom';
	import { PopoverBond, type PopoverParams } from '../bond.svelte';
	import type { BondVirtualElement } from '$svelte-atoms/core/shared/bond.svelte';
	import { OverlayBond } from '$svelte-atoms/core/components/overlay';
	import { PortalBond } from '$svelte-atoms/core/components/portal';

	const overlayBond = OverlayBond.get();

	const bond = PopoverBond.get();

	// In-scope Portal; its boundary clips the overlay to this Portal (ADR 0008 D1).
	const portalBond = PortalBond.get();
	const boundary = $derived(portalBond?.boundaryElement);

	const tracking = $derived(bond?.state.shouldTrackPosition ?? false);
	const reference = $derived(bond?.element<BondVirtualElement>('virtual-trigger') ?? bond?.element<Element>('trigger'));
	const overlay = $derived(bond?.element<HTMLElement>('overlay'));

	// Strategy follows the trigger's scroll context: 'fixed' while viewport-anchored
	// (fixed ancestor, or stuck sticky ancestor), else 'absolute'. Keeps trigger and
	// overlay in one reference frame so the overlay stays pinned without per-frame recompute.
	let stickyStrategy = $state<Strategy>('absolute');

	$effect(() => {
		const anchor = findAnchor(bond?.element<Element>('trigger'));

		// No detached ancestor, or a fixed one → constant strategy.
		if (!anchor) {
			stickyStrategy = 'absolute';
			return;
		}
		if (anchor.style.position === 'fixed') {
			stickyStrategy = 'fixed';
			return;
		}

		// Sticky: 'absolute' until pinned, 'fixed' while stuck. Inset the observer root by top+1px
		// so the element clips by 1px at the stick boundary (ratio < 1 = stuck). Fires once up
		// front to seed state (e.g. opening while already stuck).
		stickyStrategy = 'absolute';
		const inset = parseFloat(anchor.style.top) || 0;
		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (entry) stickyStrategy = entry.intersectionRatio < 1 ? 'fixed' : 'absolute';
			},
			{
				root: getScrollContainer(anchor.element),
				rootMargin: `${-(inset + 1)}px 0px 0px 0px`,
				threshold: [1]
			}
		);
		observer.observe(anchor.element);

		return () => observer.disconnect();
	});

	$effect.pre(() => {
		const base = overlayBond?.positionStrategy ?? 'absolute';
		const strategy: Strategy = base === 'fixed' ? 'fixed' : stickyStrategy;

		// Re-run once the Portal boundary resolves (it may mount after this popover).
		void boundary;

		if (!bond || !reference || !overlay || !tracking) return;

		// Re-runs on strategy flip (sticky stick/unstick): tears down auto-update, recomputes.
		const cleanup = compute(bond, strategy)({}, autoUpdate);

		return () => cleanup?.();
	});

	function compute(bond: PopoverBond, strategy: Strategy) {
		return (props: Record<string, unknown>, updater?: typeof autoUpdate) => {
			const { offset: ofs, placements, placement } = bond.state.props;

			const arrowElement = bond.element<HTMLElement>('arrow');

			if (!reference || !overlay) {
				return;
			}

			// Middleware stack. flip/shift/hide measure overflow against `boundary` — the in-scope
			// Portal's clip box (ADR 0008 D1) — so the overlay stays inside it, not the viewport.
			const middleware: ComputePositionConfig['middleware'] = [
				offset(ofs),
				flip({
					fallbackPlacements: placements,
					padding: 8,
					crossAxis: true,
					fallbackStrategy: 'bestFit',
					boundary: boundary ?? 'clippingAncestors'
				}),
				shift({
					padding: 8,
					boundary: boundary ?? 'clippingAncestors',
					limiter: {
						fn: (state) => {
							const { x, y } = state;
							return { x, y };
						}
					}
				})
			];

			if (arrowElement) {
				middleware.push(arrow({ element: arrowElement }));
			}

			// Hide the overlay when the anchor scrolls out of view, skipping layout work.
			middleware.push(hide());

			const onchangeCallback = props.onchange as PopoverParams['onchange'];

			const compute = async () => {
				const position = await computePosition(reference, overlay, {
					placement: placement ?? 'bottom',
					middleware,
					strategy
				});

				// Round to 0.01px to avoid churn from sub-pixel changes.
				const x = Math.round((position.x ?? 0) * 100) / 100;
				const y = Math.round((position.y ?? 0) * 100) / 100;

				bond.state.notifyComputed({
					middlewareData: position.middlewareData,
					placement: position.placement,
					strategy: position.strategy,
					x,
					y
				});
				onchangeCallback?.(overlay, position);

				// Publish the trigger's measured size as CSS vars so content can match it — via a
				// class (`min-w-[var(--sa-anchor-width)]`) or the sizing props
				// (`minWidth="var(--sa-anchor-width)"`). Reuses computePosition's layout read.
				if (reference && reference instanceof Element) {
					overlay.style.setProperty('--sa-anchor-width', `${reference.clientWidth}px`);
					overlay.style.setProperty('--sa-anchor-height', `${reference.clientHeight}px`);
				}
			};

			// Auto-update if provided, else compute once.
			if (updater) {
				return updater(reference, overlay, compute, {
					ancestorScroll: true,
					// Off: thrashes its IntersectionObserver at scroll edges (recompute storm);
					// hide() covers the out-of-view case instead.
					layoutShift: false
				});
			}

			compute();
		};
	}

	// Nearest fixed/sticky ancestor (or the trigger itself) — detached from scroll flow.
	function findAnchor(el: Element | null | undefined) {
		for (let node = el; node && node !== document.documentElement; node = node.parentElement) {
			const style = getComputedStyle(node);
			if (style.position === 'fixed' || style.position === 'sticky') {
				return { element: node, style };
			}
		}
		return null;
	}

	// Nearest scrollable ancestor — the observer root the sticky element pins within
	// (null = viewport).
	function getScrollContainer(el: Element): Element | null {
		for (let node = el.parentElement; node; node = node.parentElement) {
			const { overflow, overflowY } = getComputedStyle(node);
			if (/(auto|scroll|overlay)/.test(overflowY + overflow)) return node;
		}
		return null;
	}
</script>
