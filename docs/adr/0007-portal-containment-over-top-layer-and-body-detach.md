# ADR 0007: Portal containment over native top layer and body-detach portals

## Status

Accepted

## Date

2026-07-07

## Context

The portal runtime serves overlay components such as Dialog, Drawer, Popover, Tooltip, Sidebar, and Toast. It must support nested overlays, host-scoped clipping/scrolling, semantic z bands, and anchor-relative ordering such as rendering a popover below a sticky header inside a dialog.

Two common alternatives are available:

- Native top layer via `dialog.showModal()` or the Popover API.
- Body-detached portals with global fixed z-index tokens.

Both alternatives simplify some overlay concerns, but neither can express the project’s containment-first behavior as the default model.

## Decision

Keep the library’s default portal model as in-place containment portals with library-owned elevation.

A portal is a place inside the current DOM/stacking context. Overlay content may be ported into that place, but the place itself remains physically inside its host. The portal sink is also the floating-ui boundary, so nested overlays scroll, clip, flip, shift, and stack with their host surface.

Do not use the native top layer or body-detached portal hosts as the default overlay mechanism.

## Rationale

### Native top layer is not the default

The native top layer promotes elements into a global platform-managed stack. That gives useful browser behavior, but it removes the library’s ability to interleave overlay families with in-page stacking rules.

The following requirements are load-bearing and are not expressible as a blanket top-layer switch:

- Render a positioned overlay below or above an in-flow anchor such as a sticky dialog header.
- Keep nested popovers clipped and positioned against the host portal boundary.
- Let semantic bands interleave predictably, for example ambient feedback above modal surfaces.
- Preserve one library-owned ordering model across Dialog, Drawer, Popover, Tooltip, Sidebar, and Toast.

The top layer may still be reconsidered as a capability if platform behavior becomes necessary for accessibility and the project can preserve cross-family interleaving.

### Body-detach portals are not the default

Body-detached portals move overlay content to a global host and usually rely on fixed z-token scales. That model is simpler, but it discards host containment: nested overlays no longer naturally ride the host card, scroll with it, or use the host sink as the floating boundary.

The project previously carried a body-detached `portalLayerCapability`; it was removed because it created a second portal/elevation mechanism that contradicted the containment-first runtime.

## Consequences

- Portal targeting and z/elevation rules must remain centralized and documented.
- Modal completeness must be supplied through capabilities such as focus trap, escape handling, body scroll lock, and inert siblings rather than assuming native `showModal()` semantics.
- If the current P0 runtime remains insufficient, the v2 direction is to deepen portal ownership with a single surface/elevation path, not to switch to body-detached hosts.

## Revisit conditions

Reopen this decision only if one of these becomes true:

1. Capability-based modality cannot meet accessibility requirements even after scroll lock and inert siblings are activated.
2. Ambient-band surfaces can promote together with modal surfaces without losing required interleaving.
3. Anchor-relative ordering across modal/positioned boundaries is no longer a product requirement.
4. CSS/platform primitives evolve enough to express host-contained, anchor-relative, cross-family ordering without a library-owned elevation model.

## References

- `docs/research/portal-zlayer-review-2026-07.md`
- `docs/research/portal-zlayer-redesign-2026-07.md`
- `docs/research/portal-zlayer-p0-contract-map-2026-07.md`
