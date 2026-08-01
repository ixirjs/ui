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
	import {
		notifyPopoverComputed,
		popoverNode,
		PopoverBond,
		shouldTrackPopoverPosition,
		type PopoverParams
	} from '../bond.svelte';
	import type { BondVirtualElement } from '$svelte-atoms/core/shared/bond';
	import { PortalBond } from '$svelte-atoms/core/components/portal';

	const bond = PopoverBond.get();

	// In-scope Portal; its boundary clips the overlay to this Portal.
	const portalBond = PortalBond.get();
	const boundary = $derived(portalBond?.boundaryElement);

	const tracking = $derived(bond ? shouldTrackPopoverPosition(bond) : false);
	const reference = $derived(
		(bond
			? (popoverNode(bond, 'virtual-trigger')?.element as BondVirtualElement | undefined)
			: undefined) ??
			(bond ? (popoverNode(bond, 'trigger')?.element as Element | undefined) : undefined)
	);
	const overlay = $derived(
		bond ? (popoverNode(bond, 'overlay')?.element as HTMLElement | undefined) : undefined
	);

	// CSS positioning strategy, set explicitly by the consumer via the `position` root prop.
	const position = $derived<Strategy>(bond?.props.position ?? 'absolute');

	$effect.pre(() => {
		// Re-run once the Portal boundary resolves (it may mount after this popover).
		void boundary;

		if (!bond || !reference || !overlay || !tracking) return;

		// Re-runs if the `position` strategy changes: tears down auto-update, recomputes.
		const cleanup = compute(bond, position)({}, autoUpdate);

		return () => cleanup?.();
	});

	function compute(bond: PopoverBond, strategy: Strategy) {
		return (props: Record<string, unknown>, updater: typeof autoUpdate | undefined = undefined) => {
			const { offset: ofs, placements, placement } = bond.props;

			const arrowElement = popoverNode(bond, 'arrow')?.element as HTMLElement | undefined;

			if (!reference || !overlay) {
				return;
			}

			// Middleware stack. flip/shift/hide measure overflow against `boundary` — the in-scope
			// Portal's clip box — so the overlay stays inside it, not the viewport.
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

				notifyPopoverComputed(bond, {
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
</script>
