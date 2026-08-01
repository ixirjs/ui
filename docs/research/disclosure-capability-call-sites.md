# Disclosure Capability Call Sites

Phase 3 introduces `DISCLOSURE` as the conceptual home for open/close/toggle state. The
trigger/content relationship still receives a disclosure surface so it can project `aria-expanded`,
but it no longer exposes that surface under `TRIGGER_CONTENT`.

## Desired Shape

```ts
const disclosure = createDisclosure({
	get: () => props.open,
	set: (open) => (props.open = open)
});

state.capability(disclosureCapability(disclosure));
state.capability(triggerContentLink(disclosure, { contentRole: 'region' }));
```

For relationship-only users, `triggerContentLink` remains the ARIA wiring primitive:

```ts
state.capability(triggerContentLink(disclosure, { contentRole: 'group' }));
```

For model consumers, `DISCLOSURE` is the retrieval slot:

```ts
const disclosure = state.requireSurface(DISCLOSURE);
disclosure.toggle();
```

For activation consumers, the disclosure model is activated by policy capabilities:

```ts
state.capability(disclosureTrigger());
state.capability(disclosureClose({ role: 'close' }));
state.capability(disclosureToggle({ role: 'toggle' }));
```

## Evaluated Call Sites

- [x] `Collapsible`
  - State owns `createDisclosure({ props.open })`.
  - Registers `disclosureCapability(this.disclosure)`.
  - Keeps `triggerContentLink(this.disclosure, { contentRole: 'region' })` for ARIA wiring.
  - Registers `disclosureTrigger()` for guarded click and Enter/Space activation.
- [x] `Tree`
  - State owns `createDisclosure({ props.open })`.
  - Registers `disclosureCapability(this.disclosure)`.
  - Keeps `triggerContentLink(this.disclosure, { contentRole: 'group' })` for ARIA wiring.
  - Registers `disclosureTrigger({ event: 'pointerdown' })` so pointer activation stays compatible while keyboard activation becomes shared.
- [x] `AccordionItem`
  - State owns a parent-selection-backed disclosure.
  - Registers `disclosureCapability(this.#disclosure)`.
  - Keeps `triggerContentLink(this.#disclosure, { contentRole: 'region' })` for ARIA wiring.
  - Activation remains accordion-specific because single-item accordion behavior coordinates sibling state.
- [x] `Toast`
  - State owns `createDisclosure({ props.open })`.
  - Registers `disclosureCapability(state.disclosure)` through the bond capability factory.
  - Registers `disclosureClose({ disabled: false, stopPropagation: true })` for the close role.
- [x] overlays
  - `OverlayState` exposes `disclosure`.
  - `OverlayState` registers `disclosureCapability(this.disclosure)`.
  - Overlay trigger, focus, and escape policies remain separate policy slots.

## Phase 4 Activation Notes

- `disclosureTrigger()` defaults to role `trigger`, action `toggle`, click activation, and Enter/Space keyboard activation.
- `disclosureClose()` defaults to role `close` and action `close`.
- `disclosureToggle()` defaults to role `toggle` and action `toggle`.
- Activation is guarded by default through `state.isDisabled` or `state.props.disabled`; callers can pass `disabled: false` when close behavior should remain available.
- Overlay trigger policies stay separate because they carry overlay-specific ARIA and focus behavior.

## Phase 5 Dismissal Notes

- Dismissal ships as split Layer 1 primitives, not one broad `dismissPolicy`.
- Escape remains in the existing `ESCAPE` slot through `closeOnEscape`, `ignoreEscape`, and `clearThenClose`.
- `outsidePressDismiss()` owns outside-press dismissal through the `OUTSIDE_PRESS` slot and preserves overlay stack coordination.
- `backdropPressDismiss()` owns backdrop-role dismissal through the `BACKDROP_PRESS` slot and preserves overlay stack coordination.
- Modal bundles include backdrop press and disclosure close policy; positioned bundles include outside press and disclosure close policy.
- `Dialog.Close`, `Drawer` close attachments, and `Toast.Close` close through disclosure state; Drawer backdrop and Popover outside press use dismissal primitives.

## Non-Goals For Phase 3

- Do not merge overlay trigger policies with generic disclosure activation yet.
- Do not move dismissal behavior into disclosure; dismissal is a separate primitive family.
