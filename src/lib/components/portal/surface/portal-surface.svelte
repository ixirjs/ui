<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { DEV } from 'esm-env';
	import { createAttachmentKey } from 'svelte/attachments';
	import { type Base, type BasePropsOf } from '$ixirjs/ui/components/atom';
	import type { HtmlElementTagName } from '$ixirjs/ui/components/element';
	import { overlayIsOpen } from '$ixirjs/ui/components/overlay/policies/overlay-view';
	import { PortalBond } from '$ixirjs/ui/components/portal/instance/bond.svelte';
	import {
		describePortalTarget,
		PortalsBond,
		resolveTeleportTarget
	} from '$ixirjs/ui/components/portal/registry';
	import { hasUnresolvedExplicitTarget } from '$ixirjs/ui/components/portal/registry/utils';
	import { port } from '$ixirjs/ui/components/portal/mounting/port';
	import type { PortalSurfaceProps } from '$ixirjs/ui/components/portal/types';
	import ActivePortal from '$ixirjs/ui/components/portal/mounting/active-portal.svelte';

	let {
		portal = undefined,
		owner = undefined,
		band = undefined,
		order = undefined,
		'z-index': zIndex = undefined,
		as,
		base,
		children,
		style = undefined,
		class: klass = undefined,
		...restProps
	}: PortalSurfaceProps<E, B> & BasePropsOf<B> = $props();

	const portalsBond = PortalsBond.get();
	const ambientPortal = $derived(PortalBond.get());
	const targetPortal = $derived(resolveTeleportTarget(portalsBond, portal, ambientPortal));
	const targetElement = $derived(targetPortal?.sinkElement);
	const unresolvedExplicitTarget = $derived(hasUnresolvedExplicitTarget(portalsBond, portal));
	const isOpen = $derived(owner ? overlayIsOpen(owner) : true);
	const liveRank = $derived(
		owner !== undefined && band !== undefined && targetPortal
			? (portalsBond?.rankOf(owner, band, targetPortal) ?? 0)
			: 0
	);
	type RankedEnrollment = {
		owner: NonNullable<typeof owner>;
		band: NonNullable<typeof band>;
		portal: PortalBond;
		rank: number;
	};
	let retainedEnrollment = $state.raw<RankedEnrollment>();
	const retainsCurrentEnrollment = $derived(
		retainedEnrollment !== undefined &&
			retainedEnrollment.owner === owner &&
			retainedEnrollment.band === band &&
			retainedEnrollment.portal === targetPortal
	);
	$effect(() => {
		if (liveRank > 0 && owner && band !== undefined && targetPortal) {
			retainedEnrollment = { owner, band, portal: targetPortal, rank: liveRank };
		} else if (retainedEnrollment && !retainsCurrentEnrollment) {
			retainedEnrollment = undefined;
		}
	});
	// Preserve rank only while the same enrollment closes and its exit animation runs.
	const rank = $derived(
		liveRank || (retainsCurrentEnrollment ? (retainedEnrollment?.rank ?? 0) : 0)
	);
	const z = $derived(
		targetPortal && band !== undefined
			? targetPortal.elevation({ band, relation: order, rank, 'z-index': zIndex })
			: undefined
	);
	const surfaceStyle = $derived(
		z === undefined ? style : [style, `z-index: ${z}; --ixir-z: ${z}`].filter(Boolean).join('; ')
	);

	const content = $derived(targetElement ? ui : undefined);

	$effect(() => {
		if (!owner || band === undefined || !targetPortal || !isOpen) return;
		return portalsBond?.enrollOverlay(owner, band, targetPortal);
	});

	$effect(() => {
		if (!DEV) return;
		if (unresolvedExplicitTarget) {
			const fallback = targetPortal
				? ` using fallback portal "${targetPortal.props.id}".`
				: ' no fallback portal resolved; nothing is ported.';
			console.warn(
				`[ixirjs] <PortalSurface${describePortalTarget(portal)}>: explicit portal target did not resolve;${fallback}`
			);
			return;
		}
		if (!targetElement) {
			console.warn(
				`[ixirjs] <PortalSurface${describePortalTarget(portal)}>: no portal sink resolved; nothing is ported.`
			);
		}
	});

	function teleport(node: HTMLElement) {
		return port(node, targetElement);
	}

	// `{@attach}` is markup syntax; the seam takes a props object, so the attachment rides its own
	// key. Minted once per instance so the node is not re-ported on every invalidation.
	const teleportKey = createAttachmentKey();

	// Element seam instead of a component boundary; key order matches the previous call exactly.
	// A consumer `base` still escalates — the seam decides that, rather than this call site
	// committing to a component boundary whether one was passed or not.
	const el = Kernel.element(Kernel.static, () => ({
		[teleportKey]: teleport,
		as: as as E,
		base,
		class: klass ?? undefined,
		...(restProps as Record<string, unknown>),
		style: surfaceStyle,
		'data-band': band,
		'data-portal': targetPortal?.props.id
	}));
</script>

{@render content?.()}

{#snippet ui()}
	{@render Kernel.render(el)(el, surfaceBody)}
{/snippet}

{#snippet surfaceBody()}
	<!-- `ui` exists only after targetElement resolved from this concrete target. -->
	<ActivePortal portal={targetPortal!}>
		{@render children?.({ portal: targetPortal!, z })}
	</ActivePortal>
{/snippet}
