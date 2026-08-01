# Capability Implementation Roadmap

Derived from `docs/research/capability-patterns-report.md`.

## Phase 1: Protocol Vocabulary

- [x] Add optional metadata to `Capability`.
- [x] Add faceted authoring helpers:
  - [x] `defineModelCapability`
  - [x] `defineProjectionCapability`
  - [x] `defineRelationshipCapability`
  - [x] `definePolicyCapability`
  - [x] `defineEffectCapability`
  - [x] `defineFocusedCapability`
  - [x] `defineArchetypeCapabilities`
- [x] Expose metadata through diagnostics.
- [x] Document the taxonomy and Layer 1 / 2 / 3 catalog.

## Phase 2: Annotate Existing High-Signal Capabilities

- [x] Convert existing definitions to faceted helpers where obvious.
- [x] Annotate `collectionCapability` as model/projection metadata.
- [x] Annotate `selectionCapability` as model/projection metadata.
- [x] Annotate `rovingCapability` as model/projection metadata.
- [x] Annotate `inputCapability` as model/projection metadata.
- [x] Annotate `triggerContentLink` as a relationship capability.
- [x] Annotate `labelledControl` as a relationship capability.
- [x] Annotate trigger policies as policy capabilities.
- [x] Annotate focus capabilities as policy/effect capabilities.
- [x] Annotate escape capabilities as policy/effect capabilities.
- [x] Annotate `navigationCapability` as a policy capability.
- [x] Keep behavior unchanged while metadata becomes useful in diagnostics and docs.

## Phase 3: First-Class Disclosure Primitive

- [x] Introduce a `DISCLOSURE` capability slot.
- [x] Wrap `createDisclosure` as `disclosureCapability`.
- [x] Keep `triggerContentLink` focused on relationship wiring.
- [x] Stop treating trigger/content relationship as the conceptual home for disclosure state.
- [x] Write desired call sites before migrating components in `docs/research/disclosure-capability-call-sites.md`.
- [x] Evaluate call sites in:
  - [x] `Collapsible`
  - [x] `Tree`
  - [x] `AccordionItem`
  - [x] `Toast`
  - [x] overlays

## Phase 4: Disclosure Activation Policy

- [x] Add reusable disclosure activation helpers for trigger, close, and toggle roles.
- [x] Support guarded click activation.
- [x] Support keyboard activation where appropriate.
- [x] Replace hand-written disclosure click/key handlers where safe.
- [x] Keep overlay trigger policies separate until a lower-level activation helper is proven.

## Phase 5: Dismissal Primitives

- [x] Decide whether dismissal ships as one `dismissPolicy` or split primitives.
- [x] Model Escape dismissal.
- [x] Model outside press dismissal.
- [x] Model backdrop press dismissal.
- [x] Preserve stack coordination for topmost overlays.
- [x] Apply to likely first users:
  - [x] Drawer backdrop
  - [x] Popover outside press
  - [x] Dialog close behavior
  - [x] Drawer close behavior
  - [x] Toast dismiss behavior

## Phase 6: Typeahead Over Collection + Roving

- [x] Add `typeaheadCapability`.
- [x] Compose with `collectionCapability`.
- [x] Compose with `rovingCapability`.
- [x] Support buffered text search.
- [x] Support timeout cleanup.
- [x] Target dropdown/select/menu-like components first.

## Phase 7: Relationship Expansion

- [x] Add `tabPanelLink`.
- [x] Add `errorMessageLink`.
- [x] Add row/column/cell relationship capability.
- [x] Add tree item/group relationship capability.
- [x] Start with `tabPanelLink`, since tabs already use selection and have atom-local relationship logic.

## Phase 7.5: Complete Reported Layer 1 Relationship Candidates

- [x] Add `activeDescendantLink` for control/container active item references.
- [x] Add `menuSubmenuRelationship` for menuitem/submenu ownership.
- [x] Add `optionCollectionRelationship` for option/listbox-menu-radio-group ownership.
- [x] Add `headingSectionRelationship` for title/description labelling a section or surface.
- [x] Add `liveRegionRelationship` for labelled/described live-region announcements.

## Phase 8: Validation + Status

- [x] Add `validationCapability` once field/input/select/checkbox/form validation converges.
- [x] Add `statusCapability` only where repeated status attrs are obvious.
- [x] Keep status scoped; avoid a large generic status map too early.
- [x] Pair validation with `labelledControl` and future `errorMessageLink`.

## Phase 8.5: Remaining Layer 1 State/Model Candidates

- [x] Add `checkedCapability` for checked/unchecked/mixed state.
- [x] Add `sortCapability` for sort key, direction, and priority.
- [x] Add `progressValueCapability` for value, max, percent, indeterminate, and completed state.
- [x] Keep these primitive and component-agnostic so future component migrations can adopt them incrementally.

## Phase 8.6: Complete Reported Layer 1 State/Model Candidates

- [x] Add `pressedCapability` for pressed/unpressed toggle state.
- [x] Add `rangeValueCapability` for min/max/step/value/percent state.
- [x] Add `loadingCapability` for pending, settled, error, and stale state.
- [x] Add `paginationCapability` for page, page size, total, and navigation boundaries.
- [x] Add `viewportCapability` for viewport size, scroll position, and visible range.
- [x] Add `geometryCapability` for named element rects and measured geometry.
- [x] Add `dateSelectionCapability` for single date, range start/end, and visible month.

## Phase 8.7: Complete Reported Layer 1 Role Projection Candidates

- [x] Add `orientationProjection` for reusable horizontal/vertical role attrs.
- [x] Add `disabledProjection` for reusable `aria-disabled`, native disabled, and tabindex guard attrs.
- [x] Add `currentProjection` for reusable `aria-current` page/step/date/nav attrs.

## Phase 8.8: Complete Reported Layer 1 Interaction Policy Candidates

- [x] Add `focusTrigger` for focus open and blur close/scheduled close.
- [x] Add `activationPolicy` for generic button-like click/keyboard activation.
- [x] Add `clearPolicy` for clearing values, queries, and selections.
- [x] Add `thumbDragPolicy` for dragging a thumb along a track.
- [x] Add `trackPressPolicy` for moving a value or scroll position from a track press.
- [x] Add `resizeHandlePolicy` for resize drag handles.
- [x] Add `reorderDragPolicy` for drag/drop reordering.
- [x] Add `longPressPolicy` for press-and-hold actions.
- [x] Add `swipePolicy` for touch/pointer swipe navigation or dismissal.

## Phase 9: Layer 2 Focused Compositions

- [x] Add `selectableCollectionCapability`.
- [x] Add `navigableCollectionCapability`.
- [x] Add `filterableCollectionCapability`.
- [x] Add `dismissPolicy`.
- [x] Add `labelledFieldCapability`.
- [x] Add `validatedControlCapability`.
- [x] Keep focused capabilities component-agnostic.

## Phase 10: Layer 3 Archetype Bundles

- [x] Add `listboxCapabilities`.
- [x] Add `menuCapabilities`.
- [x] Add `tabsCapabilities`.
- [x] Add `treeCapabilities`.
- [x] Add `gridCapabilities`.
- [x] Consider later archetype bundles:
  - [x] `toastCapabilities`
  - [x] `fieldCapabilities`
  - [x] `datePickerCapabilities`
- [x] Keep archetype bundles mostly as recipes over lower-layer primitives.

## Recommended Next Commit

- [x] Start with Phase 2: annotate existing high-signal capabilities.
- [x] Verify that all Phase 2 changes preserve runtime behavior.
- [x] Add focused diagnostics tests for representative existing capabilities.
