<script lang="ts">
	import { DEV } from 'esm-env';
	import * as floating from '@floating-ui/dom';
	import type { ComputePositionConfig, ReferenceElement, Strategy } from '@floating-ui/dom';
	import { PopoverContext, type PopoverBondBase, type PopoverParams } from '../bond.svelte';
	import type { PortalBond } from '$ixirjs/ui/components/portal';

	let { portal = undefined }: { portal?: PortalBond | undefined } = $props();

	const bond = PopoverContext.get();

	type AutoUpdate = typeof floating.autoUpdate;

	// The content-resolved Portal owns both the teleport sink and floating boundary.
	const boundary = $derived(portal?.sinkElement);

	// The elements are looked up inside the effect, not in a `$derived`: a part announces its id at
	// init, before its element is in the DOM, and the effect runs after the flush that inserted it.
	// Reading `bond.element(part)` tracks the announced id, so a tail mounting later re-runs this.
	$effect(() => {
		// Run after PortalSurface commits its attachment so floating-ui measures the canonical sink.
		void boundary;

		if (!bond || !bond.shouldTrackPosition) return;
		const reference = bond.reference;
		const overlay = bond.element('overlay');
		const tail = bond.element('tail');
		if (!reference || !overlay) return;

		// CSS positioning strategy, set explicitly by the consumer via the `position` root prop.
		// Re-runs if it changes: tears down auto-update, recomputes.
		const strategy: Strategy = bond.props.position ?? 'absolute';
		const cleanup = compute(bond, strategy, reference, overlay, tail)({}, floating.autoUpdate);

		return () => cleanup?.();
	});

	function compute(
		bond: PopoverBondBase,
		strategy: Strategy,
		referenceElement: ReferenceElement,
		overlayElement: HTMLElement,
		tailElement: HTMLElement | null
	) {
		// AutoUpdate may invoke its callback after the owning effect is destroyed. Snapshot all
		// inputs at setup so late measurements never read inert Svelte state.
		const boundaryElement = boundary;
		const { offset: ofs, placements, placement } = bond.props;

		return (props: Record<string, unknown>, updater: AutoUpdate | undefined = undefined) => {
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

				bond.notifyComputed({
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
				// A virtual anchor (ContextMenu) has no box to publish.
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
