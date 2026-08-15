<script lang="ts">
	import { DEV } from 'esm-env';
	import * as floating from '@floating-ui/dom';
	import type { ComputePositionConfig, Strategy } from '@floating-ui/dom';
	import {
		notifyPopoverComputed,
		popoverNode,
		PopoverBond,
		shouldTrackPopoverPosition,
		type PopoverParams
	} from '$ixirjs/ui/components/popover/bond.svelte';
	import type { BondVirtualElement } from '$ixirjs/ui/shared/bond';
	import type { PortalBond } from '$ixirjs/ui/components/portal';

	let { portal = undefined }: { portal?: PortalBond | undefined } = $props();

	const bond = PopoverBond.get();

	type AutoUpdate = typeof floating.autoUpdate;

	// The content-resolved Portal owns both the teleport sink and floating boundary.
	const boundary = $derived(portal?.sinkElement);

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

	$effect(() => {
		// Run after PortalSurface commits its attachment so floating-ui measures the canonical sink.
		void boundary;

		if (!bond || !reference || !overlay || !tracking) return;

		// Re-runs if the `position` strategy changes: tears down auto-update, recomputes.
		const cleanup = compute(bond, position)({}, floating.autoUpdate);

		return () => cleanup?.();
	});

	function compute(bond: PopoverBond, strategy: Strategy) {
		// AutoUpdate may invoke its callback after the owning effect is destroyed. Snapshot all
		// derived inputs at setup so late measurements never read inert Svelte deriveds.
		const boundaryElement = boundary;
		const referenceElement = reference;
		const overlayElement = overlay;
		const { offset: ofs, placements, placement } = bond.props;
		const tailElement = popoverNode(bond, 'tail')?.element as HTMLElement | undefined;

		return (props: Record<string, unknown>, updater: AutoUpdate | undefined = undefined) => {
			if (!referenceElement || !overlayElement) {
				return;
			}

			// Middleware stack. flip/shift/hide measure overflow against the resolved Portal sink,
			// so positioning and porting share the same containment boundary.
			const middleware: ComputePositionConfig['middleware'] = [
				floating.offset(ofs),
				floating.flip({
					fallbackPlacements: placements,
					padding: 8,
					crossAxis: true,
					fallbackStrategy: 'bestFit',
					boundary: boundaryElement ?? 'clippingAncestors'
				}),
				floating.shift({
					padding: 8,
					boundary: boundaryElement ?? 'clippingAncestors',
					limiter: {
						fn: (state) => {
							const { x, y } = state;
							return { x, y };
						}
					}
				})
			];

			if (tailElement) {
				// floating-ui's own `arrow()` middleware — not our naming.
				middleware.push(floating.arrow({ element: tailElement }));
			}

			// Hide the overlay when the anchor leaves the resolved Portal boundary.
			middleware.push(floating.hide({ boundary: boundaryElement ?? 'clippingAncestors' }));

			const onpositionchange = props.onpositionchange as PopoverParams['onpositionchange'];

			const compute = async () => {
				// Neither call site consumes this promise, so a rejection had nowhere to go but the
				// unhandled-rejection handler. With `ancestorScroll`, any scrollport between trigger and
				// sink keeps firing `autoUpdate` — including one *inside* the content — and the elements
				// can be torn down mid-measurement. That race is expected; anything else should be seen.
				const position = await floating
					.computePosition(referenceElement, overlayElement, {
						placement: placement ?? 'bottom',

						middleware,
						strategy
					})
					.catch((error: unknown) => {
						if (DEV && overlayElement.isConnected) {
							console.warn('[ixirjs] popover position computation failed.', error);
						}
						return undefined;
					});
				if (!position) return;

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
				onpositionchange?.(overlayElement, position);

				// Publish the trigger's measured size as CSS vars so content can match it — via a
				// class (`min-w-[var(--sa-anchor-width)]`) or the sizing props
				// (`minWidth="var(--sa-anchor-width)"`). Reuses computePosition's layout read.
				if (referenceElement instanceof Element) {
					overlayElement.style.setProperty(
						'--sa-anchor-width',
						`${referenceElement.clientWidth}px`
					);
					overlayElement.style.setProperty(
						'--sa-anchor-height',
						`${referenceElement.clientHeight}px`
					);
				}
			};

			// Auto-update if provided, else compute once.
			if (updater) {
				return updater(referenceElement, overlayElement, compute, {
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
