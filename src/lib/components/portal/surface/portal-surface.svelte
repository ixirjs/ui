<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { DEV } from 'esm-env';
	import { createAttachmentKey } from 'svelte/attachments';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import {
		PortalContext,
		type PortalBond
	} from '$ixirjs/ui/components/portal/instance/bond.svelte';
	import {
		describePortalTarget,
		PortalsContext,
		resolveTeleportTarget
	} from '$ixirjs/ui/components/portal/registry';
	import { hasUnresolvedExplicitTarget } from '$ixirjs/ui/components/portal/registry/utils';
	import { port } from '$ixirjs/ui/components/portal/mounting/port';
	import type { PortalSurfaceProps } from '$ixirjs/ui/components/portal/types';
	import type { Base, HtmlElementTagName } from '$ixirjs/ui/authoring';
	import type { Motion, PresetLike } from '$ixirjs/ui/preset';
	import ActivePortal from '$ixirjs/ui/components/portal/mounting/active-portal.svelte';

	let {
		portal = undefined,
		owner = undefined,
		band = undefined,
		order = undefined,
		'z-index': zIndex = undefined,
		as = undefined,
		base = undefined,
		children,
		style = undefined,
		...restProps
	}: PortalSurfaceProps<E, B> = $props();

	const portalsBond = PortalsContext.get();
	const ambientPortal = PortalContext.get();
	const targetPortal = $derived(resolveTeleportTarget(portalsBond, portal, ambientPortal));
	const targetElement = $derived(targetPortal?.sinkElement);
	const unresolvedExplicitTarget = $derived(hasUnresolvedExplicitTarget(portalsBond, portal));
	const isOpen = $derived(owner ? owner.isOpen : true);
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

	// The attachment rides its own key, minted once so the node is not re-ported per invalidation.
	const teleportKey = createAttachmentKey();

	// Own attributes after the consumer's: the surface owns its elevation style and band markers.
	const el = Kernel.element(
		() => ({
			[teleportKey]: teleport,
			...restProps,
			style: surfaceStyle,
			'data-band': band,
			'data-portal': targetPortal?.props.id
		}),
		{
			class: '',
			as: () => as,
			base: () => base,
			// A root that hands its props here passes its `presets` slot as `presetLayer`, and its
			// driver motion as `defaults` (Drawer.Root fades its surface) — the same two PortalHost forwards.
			layer: () => restProps.presetLayer as PresetLike | undefined,
			motion: () => (restProps.motion ?? restProps.defaults) as Motion<never> | undefined
		}
	);
	const leaf = Kernel.render(el);
</script>

{@render content?.()}

{#snippet ui()}
	{@render leaf(el, surfaceBody)}
{/snippet}

{#snippet surfaceBody()}
	<!-- `ui` exists only after targetElement resolved from this concrete target. -->
	<ActivePortal portal={targetPortal!}>
		{@render children?.({ portal: targetPortal!, z })}
	</ActivePortal>
{/snippet}
