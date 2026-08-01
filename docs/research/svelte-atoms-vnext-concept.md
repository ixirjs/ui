# Svelte Atoms vNext Concept: Particles, Atoms, and Bond Coordination

**Status:** Historical design proposal, superseded by the current docs  
**Date:** 2026-06-27  
**Scope:** Conceptual architecture, terminology, behavior model, and migration plan for evolving `@svelte-atoms/core` from the current `Atom / Bond / BondState / legacy Bond-owned Atom` model into a capability-driven model centered on `Atom`, `Bond`, and `Capability`.

> This file records the design discussion that led to the current model. Do not use it as the
> public guide. Current docs use these terms: Atom Components create runtime Atoms, Bonds coordinate
> shared state and registered Atoms, and capabilities add reusable behavior.

---

## 1. Executive Summary

The new concept keeps the chemistry metaphor, but makes the ownership model cleaner:

```text
Particles determine atom behavior.
Atoms can exist independently.
Bonds connect atoms into larger structures.
Molecules emerge from atoms + bonds + particles.
```

Translated into Svelte Atoms:

```text
Capabilities / Particles determine Atom behavior.
Atom components create their own Atoms.
Atoms can exist without a Bond.
Bonds own shared state and coordinate Atoms when a compound component needs shared behavior.
Complex UI emerges from Atoms + Bonds + Capabilities.
```

The major design shift is:

> **Bond should coordinate atoms, not manufacture them. Atom creation should live with the Atom component that renders the element.**

This change lets an atom exist independently from a bond while still allowing a bond to coordinate it when needed.

The second design shift is:

> **Bond and BondState should merge as a public concept. Shared state remains testable, but users should only need one compound-controller noun: Bond.**

---

## 2. Current Model

The current public concept is already strong:

```text
Atom
└── smallest reusable UI building block

Bond
└── shared state and coordination mechanism for multiple atoms

BondState
└── reactive state and mutation logic

legacy Bond-owned Atom
└── DOM-facing atom handle owned by a Bond
```

The current docs describe Svelte Atoms as a chemistry-inspired architecture where atoms are the smallest functional units and bonds connect and coordinate multiple atoms. The docs also describe Bonds as context-based coordination objects that manage shared state for connected atoms.

In the current implementation pattern, a compound component generally works like this:

```text
Dialog.Root
│
├── creates DialogBondState
├── creates DialogBond
├── shares DialogBond through Svelte context
└── renders children

Dialog.Content
│
├── reads DialogBond from context
├── calls bond.content()
├── receives a DialogContentAtom
└── spreads attrs / handlers / attachments into HtmlAtom
```

A simplified current-style structure looks like this:

```ts
class DialogContentAtom extends legacy Bond-owned Atom<DialogBond> {
	constructor(bond: DialogBond) {
		super(bond, 'content');
	}

	override get attrs() {
		return {
			...super.attrs,
			role: 'document'
		};
	}
}

class DialogBond extends Bond<DialogBondProps, DialogBondState, DialogBondElements> {
	content() {
		return this.atom('content', () => new DialogContentAtom(this));
	}
}
```

And the component consumes it like this:

```svelte
<script lang="ts">
	const bond = DialogBond.get();

	const props = $derived({
		...bond?.content().spread,
		...restProps
	});
</script>

<HtmlAtom {...props}>
	{@render children?.({ dialog: bond })}
</HtmlAtom>
```

This works, but it places the atom creation vocabulary inside the Bond.

---

## 3. Problem with the Current Ownership Model

The current model has a few pressure points:

### 3.1 Bond owns too much

The Bond currently owns:

```text
Bond
├── shared state access
├── context sharing
├── DOM element registry
├── atom factory methods
├── atom subclass vocabulary
├── attrs / handlers through legacy Bond-owned Atom subclasses
└── relationship behavior
```

That makes the Bond both the relationship coordinator and the atom factory.

### 3.2 legacy Bond-owned Atom cannot naturally exist without Bond

The name `legacy Bond-owned Atom` implies that this runtime atom is inherently bonded. But the new concept wants this object to be able to exist independently.

That means `legacy Bond-owned Atom` is no longer the best conceptual name.

### 3.3 Atom creation lives outside the component that renders it

The Svelte component is the place where the atom actually exists in the UI tree. So it makes sense for the Svelte component to create the runtime atom object.

Current mental model:

```text
Bond creates atom handle.
Component borrows it.
```

Better mental model:

```text
Component creates atom handle.
Bond optionally coordinates it.
```

### 3.4 Behavior is trapped in subclasses

A lot of behavior currently becomes class inheritance:

```text
DialogTriggerAtom extends legacy Bond-owned Atom
DialogContentAtom extends legacy Bond-owned Atom
DialogRootAtom extends legacy Bond-owned Atom
```

This is clear, but it makes behavior harder to reuse across components.

Example: `pressable`, `disabled`, `data-state`, `focusable`, `roving-focus-item`, and `motion` should be reusable capabilities, not repeatedly reimplemented in many subclasses.

### 3.5 The chemistry analogy becomes stronger if particles are reusable capabilities

In real atoms, particles affect how an atom behaves. In Svelte Atoms, reusable capabilities can play the same role:

```text
Subatomic Particles       UI Capabilities
─────────────────────────────────────────
Protons                   identity / role / semantic part
Neutrons                  stability / constraints / state guards
Electrons                 interaction / events / reactivity / bonding
```

The exact mapping is only metaphorical, but the design idea is strong:

> **An atom's behavior comes from the capabilities attached to it.**

---

## 4. New Concept

The new architecture introduces reusable **particles**, also called **capabilities**.

Recommended public API language:

```text
Capability
```

Recommended metaphor/documentation language:

```text
Particle
```

Reason:

- `Capability` is clearer for developers.
- `Particle` keeps the chemistry metaphor alive.
- The docs can say: “Particles are implemented as capabilities.”

---

## 5. New Architecture Diagram

```text
Svelte Atoms vNext
│
├── Atom Component
│   ├── Svelte component
│   ├── renders UI
│   ├── creates its own Atom
│   └── chooses local capabilities
│
├── Atom
│   ├── runtime atom instance
│   ├── can exist without a Bond
│   ├── owns element reference
│   ├── owns local attrs / handlers / attachments
│   ├── installs atom-level capabilities
│   └── may register with a Bond
│
├── Bond
│   ├── shared reactive state
│   ├── derived values and mutation methods
│   ├── context provider / consumer
│   ├── registry of mounted Atoms
│   ├── relationship coordinator
│   ├── bond-level capabilities for state, coordination, and effects
│   └── no longer the primary atom factory
│
└── Capability / Particle
    ├── reusable behavior unit
    ├── may provide attrs
    ├── may provide handlers
    ├── may provide attachments
    ├── may provide lifecycle hooks
    ├── may provide state API
    └── may depend on other capabilities
```

---

## 6. Terminology Changes

### 6.1 Rename `legacy Bond-owned Atom` to `Atom`

Recommended rename:

```text
legacy Bond-owned Atom → Atom
```

Why:

```text
legacy Bond-owned Atom
└── implies the atom cannot exist without a Bond

Atom
└── represents the runtime atom instance tied to a rendered node
```

Other possible names:

```text
AtomInstance
AtomHandle
ElementAtom
PartAtom
```

Best option:

```text
Atom
```

Reason: it clearly means “the runtime atom/controller for an atom component.”

### 6.2 Keep `Atom` for Svelte components

```text
Atom Component
= the Svelte component users render

Atom
= the runtime object created by the Atom Component
```

Example:

```text
Dialog.Content.svelte
└── creates Atom(kind: 'dialog.content')
```

### 6.3 Keep `Bond`, Merge `BondState` Into It

`Bond` remains a central concept, but its job becomes clearer.

```text
Bond
= compound controller
= shared state + mutations + context + Atom coordination
```

The Bond should coordinate existing Atoms instead of being responsible for creating every possible Atom. It should also become the public home for shared reactive state.

Why merge `BondState` publicly:

- `Atom` and `Capability` add new useful concepts.
- Keeping `BondState` as another public noun makes the model feel heavier than it needs to be.
- Most users think of a compound component as having one controller.
- State can remain DOM-free and testable inside `Bond` without requiring a separate public class.

Recommended vNext shape:

```text
DialogBond
├── props / shared reactive state
├── derived values
├── mutation methods
├── state-focused capabilities
├── coordination-focused capabilities
├── effect capabilities
└── Atom registry
```

`BondState` can remain as a compatibility class or internal implementation helper during migration, but it should not be part of the final public mental model.

### 6.4 Add `Capability` / `Particle`

```text
Capability
= reusable unit of behavior

Particle
= chemistry metaphor for capability
```

A capability can attach to:

```text
Atom
Bond
```

---

## 7. Responsibility Split

| Concept          | Owns                                                                                                        | Should Not Own                             |
| ---------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `Atom Component` | Rendering, props, local Atom creation, local capability selection                                           | Shared sibling coordination                |
| `Atom`           | Element ref, local attrs, handlers, attachments, lifecycle, atom capabilities                               | Whole compound state                       |
| `Bond`           | Shared reactive state, derived values, mutation methods, context, registry, coordination, bond capabilities | Primary atom creation, component rendering |
| `Capability`     | Reusable behavior                                                                                           | Ownership of the whole architecture        |

---

## 8. Capability Scopes

Capabilities should install into the smallest host that makes sense.

Do **not** put every capability in `Bond`. That would recreate the same centralization problem in a different place.

Instead:

```text
Capability Host
│
├── Atom
│   └── local element behavior
│
└── Bond
    ├── shared state behavior
    ├── relationship / coordination behavior
    └── whole-pattern effects
```

There are only two public capability hosts:

```text
Atom capabilities
└── affect one rendered atom

Bond capabilities
├── state-focused capabilities
├── coordination-focused capabilities
└── effect capabilities
```

---

## 9. Atom Capabilities

Atom capabilities affect one rendered atom.

Examples:

```text
Atom capabilities
├── elementRef
├── pressable
├── hoverable
├── focusable
├── disabled
├── dataState
├── ariaRole
├── labelledBy
├── describedBy
├── motion
├── keyboardShortcut
├── outsideClickTarget
├── triggerPart
├── contentPart
├── titlePart
└── descriptionPart
```

Example use:

```ts
const trigger = createAtomInstance({
	key: 'trigger',
	kind: 'dialog.trigger',
	bond,
	capabilities: [
		elementRef(),
		pressable(),
		dialogTrigger(),
		dataState(() => (bond?.opened ? 'open' : 'closed'))
	]
});
```

The result:

```text
Dialog.Trigger Atom
├── has an element ref
├── behaves like a pressable element
├── toggles dialog state
└── exposes data-state="open" / "closed"
```

---

## 10. State-Focused Bond Capabilities

State-focused Bond capabilities affect shared reactive state.

Examples:

```text
State-focused Bond capabilities
├── openable
├── controllable
├── selectable
├── multipleSelectable
├── collectionState
├── searchable
├── filterable
├── orientationState
├── disabledState
├── valueState
├── highlightedValue
└── activeDescendantState
```

Example:

```ts
class DialogBond extends Bond<DialogProps> {
	openable = this.use(
		openable({
			get: () => this.props.open,
			set: (value) => (this.props.open = value),
			disabled: () => this.props.disabled
		})
	);

	open() {
		this.openable.open();
	}

	close() {
		this.openable.close();
	}

	toggle() {
		this.openable.toggle();
	}
}
```

The `openable` capability could be reused by:

```text
Dialog
Popover
Collapsible
Dropdown
Drawer
Accordion item
Toast
```

---

## 11. Coordination-Focused Bond Capabilities

Coordination-focused Bond capabilities coordinate multiple Atoms. Effect capabilities install whole-pattern listeners or lifecycle work.

Examples:

```text
Coordination-focused Bond capabilities
├── registry
├── focusScope
├── focusTrap
├── rovingFocus
├── dismissableLayer
├── ariaLabelRegistry
├── collectionRegistry
├── typeahead
├── popperPositioning
├── escapeKeyStack
├── modalLayer
└── portalLayer
```

Example:

```ts
class DialogBond extends Bond<DialogProps> {
	openable = this.use(openable());
	registry = this.use(atomRegistry());
	labels = this.use(ariaLabelRegistry());
	focus = this.use(focusScope());
	layer = this.use(dismissableLayer());
}
```

The Bond remains powerful, but it becomes the compound controller instead of the place where every atom handle is created.

---

## 12. New Runtime Flow

### Current flow

```text
Child component
└── asks Bond for a legacy Bond-owned Atom
    └── Bond creates or returns the legacy Bond-owned Atom
        └── child spreads legacy Bond-owned Atom output
```

### New flow

```text
Child component
└── creates its own Atom
    ├── installs local capabilities
    ├── optionally registers with Bond
    └── spreads Atom output
```

In detail:

```text
1. Root component creates Bond.
2. Bond installs state-focused, coordination-focused, and effect capabilities.
3. Root component shares Bond through context.
4. Child Atom component gets optional or required Bond.
5. Child Atom component creates Atom.
6. Atom installs Atom capabilities.
7. Atom registers with Bond if a Bond exists.
8. Bond capabilities react to registered Atoms.
9. Atom spreads attrs / handlers / attachments onto HtmlAtom.
10. On destroy, Atom unregisters and capability cleanups run.
```

---

## 13. Dialog Example: Before and After

### 13.1 Current-style Dialog

```text
Dialog.Root
└── creates DialogBond
    ├── DialogBond.root() creates DialogRootAtom
    ├── DialogBond.content() creates DialogContentAtom
    ├── DialogBond.title() creates DialogTitleAtom
    └── DialogBond.trigger() creates DialogTriggerAtom
```

```svelte
<script lang="ts">
	const bond = DialogBond.get();

	const props = $derived({
		...bond?.content().spread,
		...restProps
	});
</script>

<HtmlAtom {...props}>
	{@render children?.({ dialog: bond })}
</HtmlAtom>
```

### 13.2 New-style Dialog

```text
Dialog.Root
├── creates DialogBond
│   ├── owns shared open state
│   ├── installs openable capability
│   ├── installs registry capability
│   ├── installs focus-scope capability
│   ├── installs dismissable-layer capability
│   └── shares itself through context
│
└── renders children
```

```text
Dialog.Content
├── gets DialogBond from context
├── creates Atom('content')
├── installs dialogContent capability
├── registers with DialogBond
└── renders HtmlAtom
```

```svelte
<script lang="ts">
	const bond = DialogBond.get();

	const content = createAtomInstance({
		key: 'content',
		kind: 'dialog.content',
		bond,
		capabilities: [
			elementRef(),
			dialogContent(),
			dataState(() => (bond?.opened ? 'open' : 'closed'))
		]
	});

	const props = $derived({
		...content.spread,
		...restProps
	});
</script>

<HtmlAtom {...props}>
	{@render children?.({ dialog: bond, atom: content })}
</HtmlAtom>
```

### 13.3 Dialog Trigger with capabilities

```svelte
<script lang="ts">
	const bond = DialogBond.get();

	const trigger = createAtomInstance({
		key: 'trigger',
		kind: 'dialog.trigger',
		bond,
		capabilities: [
			elementRef(),
			pressable(),
			dialogTrigger(),
			dataState(() => (bond?.opened ? 'open' : 'closed'))
		]
	});

	const props = $derived({
		...trigger.spread,
		...restProps
	});
</script>

<HtmlAtom as="button" {...props}>
	{@render children?.({ dialog: bond, atom: trigger })}
</HtmlAtom>
```

---

## 14. Proposed Core APIs

These are conceptual shapes, not final implementation code.

### 14.1 Atom

```ts
type AtomKind = string;
type AtomKey = string;

type AtomOptions<B extends Bond | undefined = Bond | undefined> = {
	key: AtomKey;
	kind: AtomKind;
	bond?: B;
	id?: string;
	capabilities?: AtomCapability[];
	required?: boolean;
};

class Atom<
	B extends Bond | undefined = Bond | undefined,
	E extends Element | BondVirtualElement = Element
> {
	readonly key: AtomKey;
	readonly kind: AtomKind;
	readonly bond?: B;

	element = $state<E | undefined>();

	get attrs(): Record<string, unknown>;
	get handlers(): Record<string, unknown>;
	get attachments(): Record<string | symbol, unknown>;
	get spread(): Record<string | symbol, unknown>;

	use<TApi>(capability: AtomCapability<this, TApi>): TApi;
	setElement(element: E | undefined): void;
	destroy(): void;
}
```

### 14.2 Bond registry

```ts
class Bond<Props extends BondProps = BondProps> {
	readonly props: Props;

	register(atom: Atom): () => void;
	unregister(atom: Atom): void;

	node(key: string): Atom | undefined;
	nodes(kind?: string): Atom[];

	use<TApi>(capability: BondCapability<this, TApi>): TApi;
	get<TApi>(token: CapabilityToken<TApi>): TApi | undefined;
	require<TApi>(token: CapabilityToken<TApi>): TApi;
}
```

### 14.3 Capability

```ts
type CapabilityScope = 'atom' | 'bond';

type CapabilityInstallResult<TApi = unknown> = TApi & {
	attrs?: () => Record<string, unknown>;
	handlers?: () => Record<string, unknown>;
	attachments?: () => Record<string | symbol, unknown>;
	setup?: () => void | (() => void);
	destroy?: () => void;
};

type Capability<THost, TApi = unknown> = {
	name: string;
	scope: CapabilityScope;
	requires?: symbol[];
	provides?: symbol[];
	priority?: number;
	install(host: THost): CapabilityInstallResult<TApi>;
};
```

### 14.4 Capability tokens

Capabilities should expose typed APIs through tokens, not string lookups.

```ts
const Openable = Symbol('Openable');
const Registry = Symbol('Registry');
const FocusScope = Symbol('FocusScope');
```

Example:

```ts
const open = bond.get(Openable);
open.toggle();
```

This helps capabilities communicate without coupling directly to concrete classes.

---

## 15. Attribute, Handler, and Attachment Merge Rules

Capability composition requires deterministic merge behavior.

Without clear merge rules, capability composition becomes unpredictable.

### 15.1 Attribute merge rules

| Attribute Type | Rule                                                                   |
| -------------- | ---------------------------------------------------------------------- |
| `id`           | Single owner. Atom owns default id. User override allowed if explicit. |
| `class`        | Merge. Support string, array, object, function-derived classes.        |
| `style`        | Merge carefully. Later values override same property.                  |
| `data-*`       | Merge. Conflicts warn in dev unless values are identical.              |
| `aria-*`       | Merge when safe. Conflicts warn in dev.                                |
| `role`         | Exclusive. Conflict should warn or error in dev.                       |
| `tabindex`     | Use priority. Focus capabilities should own it unless user overrides.  |
| `disabled`     | `true` wins. Capabilities should respect disabled state.               |
| `inert`        | `true` wins.                                                           |
| `hidden`       | `true` wins.                                                           |

### 15.2 Handler merge rules

Event handlers should compose, not overwrite each other.

```ts
function composeHandlers<E extends Event>(...handlers: Array<((event: E) => void) | undefined>) {
	return (event: E) => {
		for (const handler of handlers) {
			handler?.(event);
			if (event.defaultPrevented) break;
		}
	};
}
```

Recommended order:

```text
1. internal low-level handlers
2. capability handlers by priority
3. component-level handlers
4. user-provided handlers
```

However, some libraries prefer user handlers first so users can cancel internal behavior. Pick one rule and document it.

Recommended for Svelte Atoms:

```text
User handler first, then internal handlers unless defaultPrevented.
```

That gives users maximum control.

### 15.3 Attachment merge rules

Attachments should compose with cleanup in reverse order:

```text
mount order:
1. elementRef
2. capability attachments
3. user attachment

cleanup order:
1. user attachment cleanup
2. capability cleanup
3. elementRef cleanup
```

This keeps the element ref valid during most cleanup work.

---

## 16. Optional vs Required Bonds

The new model allows Atoms to exist without Bonds.

That does **not** mean every component should silently work without a Bond.

There are two categories:

```text
Standalone atoms
├── Button
├── Badge
├── Card
├── Stack
├── Icon
└── Link
```

These can work without a Bond.

```text
Compound part atoms
├── Dialog.Trigger
├── Dialog.Content
├── Select.Item
├── Tabs.Trigger
├── Tabs.Panel
├── Dropdown.Item
└── Combobox.Option
```

These usually require a Bond to make semantic sense.

Recommended API:

```ts
const bond = DialogBond.required();
```

or:

```ts
const bond = DialogBond.optional();
```

Development-mode error:

```text
Dialog.Content must be used inside Dialog.Root.
```

For advanced use cases, a component can support fallback unbonded behavior:

```ts
const content = createAtomInstance({
	key: 'content',
	kind: 'dialog.content',
	bond: DialogBond.optional(),
	capabilities: [dialogContent({ requireBond: false })]
});
```

---

## 17. Registry Model

The Bond should maintain a registry of Atoms that are actually mounted or known.

```text
Bond Registry
├── by key
├── by kind
├── by role / part
├── by group
└── by generated id
```

Some parts are single-instance:

```text
Dialog.Content
Dialog.Title
Popover.Anchor
```

Some parts are multi-instance:

```text
Select.Item
Tabs.Trigger
Tabs.Panel
Menu.Item
List.Item
```

So the registry should support both:

```ts
bond.node('content'); // single registered Atom
bond.nodes('select.item'); // many registered Atoms
```

Suggested registration options:

```ts
type RegisterOptions = {
	key: string;
	kind: string;
	cardinality?: 'single' | 'many';
	replace?: boolean;
	group?: string;
};
```

Development warnings:

```text
Duplicate single Atom registered for dialog.content.
Previous node will be replaced.
```

---

## 18. Capability Communication

Capabilities will need to communicate.

Avoid direct class coupling like this:

```ts
bond.focusScope.doSomething();
```

Prefer capability tokens:

```ts
const focus = bond.get(FocusScope);
focus.focusFirst();
```

This allows different Bond subclasses to provide compatible capabilities.

Example:

```ts
const DialogLayer = Symbol('DialogLayer');
const DismissableLayer = Symbol('DismissableLayer');
const FocusScope = Symbol('FocusScope');
```

A capability can declare:

```ts
requires: [Registry, Openable];
provides: [DismissableLayer];
```

This enables dev-time validation:

```text
dialogContent requires Openable, but DialogBond does not provide it.
```

---

## 19. Recommended Public Mental Model

Use this in documentation:

```text
Matter
└── Atoms
    ├── Particles
    │   └── determine atom behavior
    │
    └── Bonds
        └── connect atoms into molecules
```

Svelte Atoms equivalent:

```text
UI
└── Atom Components
    ├── Atoms
    │   ├── Capabilities / Particles
    │   │   └── determine atom behavior
    │   │
    │   └── optional Bond registration
    │
    └── Bonds
        └── coordinate Atoms into compound components
```

One-sentence version:

> **An Atom is a rendered atom; capabilities are its particles; a Bond coordinates multiple Atoms into a compound UI pattern.**

---

## 20. Design Rules

### Rule 1: Atom creation belongs to the component

```text
Component creates Atom.
Bond coordinates Atom.
```

### Rule 2: Install behavior at the smallest useful scope

```text
One element?        Atom capability
Shared state?       State-focused Bond capability
Multiple elements?  Coordination-focused Bond capability
Whole-pattern side effect? Effect Bond capability
```

### Rule 3: Bond state should stay DOM-free

Shared state behavior inside `Bond` should stay testable and independent from mounted Atoms. A Bond should be useful in tests before any DOM exists.

### Rule 4: Bond should not render

`Bond` should coordinate and expose behavior, not render UI.

### Rule 5: Capabilities should be reusable

If the same behavior appears in multiple components, make it a capability.

### Rule 6: Merge behavior must be deterministic

Attrs, handlers, and attachments need clear merge rules.

### Rule 7: Old APIs should migrate gradually

Do not break every component at once. Keep compatibility adapters while the internal model changes.

---

# 21. Migration Plan

## Phase 1: Introduce `Atom` without removing `legacy Bond-owned Atom`

Add the new base class:

```ts
export class Atom<
	B extends Bond | undefined = Bond | undefined,
	E extends Element | BondVirtualElement = Element
> {
	// new bond-optional runtime atom instance
}
```

Keep the old class as a compatibility alias or subclass:

```ts
/** @deprecated Use Atom instead. */
export class legacy Bond-owned Atom<
	B extends Bond = Bond,
	E extends Element | BondVirtualElement = Element
> extends Atom<B, E> {
	constructor(bond: B, key: string) {
		super({
			bond,
			key,
			kind: `${bond.name}-${key}`
		});
	}
}
```

Goal:

```text
Existing code keeps working.
New code can use Atom.
```

---

## Phase 2: Add Bond registration APIs

Add explicit registration to `Bond`:

```ts
class Bond<Props extends BondProps = BondProps> {
	register(atom: Atom): () => void {
		// add to registry
		// return unregister cleanup
	}

	node(key: string): Atom | undefined {
		// get single registered atom
	}

	nodes(kind?: string): Atom[] {
		// get multiple registered atoms
	}
}
```

Keep the existing factory-style method temporarily:

```ts
protected atomFactory<T extends Atom>(
  key: string,
  factory: () => T
): T {
  // old behavior
}
```

Recommended rename for the old method internally:

```text
atom() → legacyAtom() or createLegacyAtom()
node() → registered Atom lookup
```

This makes the intent clear.

---

## Phase 3: Create `createAtomInstance()` helper

Add a helper designed for Svelte components:

```ts
export function createAtomInstance<B extends Bond | undefined, E extends Element = HTMLElement>(
	options: AtomOptions<B>
): Atom<B, E> {
	const node = new Atom<B, E>(options);

	if (options.bond) {
		node.register(options.bond);
	}

	return node;
}
```

The helper should handle:

```text
- id creation
- kind creation
- capability installation
- optional bond registration
- cleanup on destroy
- spread generation
```

---

## Phase 4: Move atom creation into components

### Before

```ts
const props = $derived({
	...bond?.content().spread,
	...restProps
});
```

### After

```ts
const content = createAtomInstance({
	key: 'content',
	kind: 'dialog.content',
	bond,
	capabilities: [dialogContent()]
});

const props = $derived({
	...content.spread,
	...restProps
});
```

The component becomes responsible for the runtime atom instance.

---

## Phase 5: Keep Bond methods as compatibility adapters

Old code may still call:

```ts
bond.content().spread;
```

Keep this working during migration.

Adapter idea:

```ts
class DialogBond extends Bond<DialogProps> {
	content() {
		return this.node('content') ?? this.legacyAtom('content', () => new DialogContentAtom(this));
	}
}
```

Better long-term:

```ts
class DialogBond extends Bond<DialogProps> {
	/** @deprecated Content Atom is now created by Dialog.Content. */
	content() {
		return this.node('content');
	}
}
```

But this should only happen after all internal components create and register their own Atoms.

---

## Phase 6: Convert legacy Bond-owned Atom subclasses into capabilities

### Before

```ts
class DialogTriggerAtom extends legacy Bond-owned Atom<DialogBond> {
	override get handlers() {
		return {
			onclick: () => this.bond.toggle()
		};
	}
}
```

### After

```ts
function dialogTrigger(): AtomCapability<Atom<DialogBond>> {
	return atomCapability({
		name: 'dialog.trigger',
		handlers: ({ atom }) => ({
			onclick: () => atom.bond?.toggle()
		}),
		attrs: ({ atom }) => ({
			'aria-expanded': atom.bond?.opened,
			'aria-controls': atom.bond?.node('content')?.id
		})
	});
}
```

Then:

```ts
const trigger = createAtomInstance({
	key: 'trigger',
	kind: 'dialog.trigger',
	bond,
	capabilities: [pressable(), dialogTrigger()]
});
```

This makes `dialogTrigger` behavior reusable and testable without subclassing.

---

## Phase 7: Convert shared state behavior into state-focused Bond capabilities

### Before

```ts
class DialogBond extends Bond<DialogProps> {
	open() {
		this.props.open = true;
	}

	close() {
		this.props.open = false;
	}

	toggle() {
		this.props.open = !this.props.open;
	}
}
```

### After

```ts
class DialogBond extends Bond<DialogProps> {
	openable = this.use(
		openable({
			get: () => this.props.open,
			set: (value) => (this.props.open = value),
			disabled: () => this.props.disabled
		})
	);

	open() {
		this.openable.open();
	}

	close() {
		this.openable.close();
	}

	toggle() {
		this.openable.toggle();
	}

	get opened() {
		return this.openable.opened;
	}
}
```

This keeps the old public methods while moving the reusable logic into a capability.

---

## Phase 8: Convert relationship behavior into Bond capabilities

Move behavior that coordinates multiple elements into Bond capabilities.

Examples:

```text
DialogBond
├── focusScope()
├── dismissableLayer()
├── ariaLabelRegistry()
└── modalLayer()
```

```ts
class DialogBond extends Bond<DialogProps> {
	openable = this.use(openable());
	registry = this.use(atomRegistry());
	labels = this.use(ariaLabelRegistry());
	focus = this.use(focusScope());
	layer = this.use(dismissableLayer());
}
```

This keeps the Bond focused on relationships.

---

## Phase 9: Deprecate Bond-owned atom factories

After components create their own Atoms, mark Bond factory methods as deprecated.

```ts
class DialogBond extends Bond<DialogProps> {
	/**
	 * @deprecated Atoms are now created by Dialog.Content.
	 * Use bond.node('content') to access the registered Atom.
	 */
	content() {
		return this.node('content');
	}
}
```

Final model:

```text
bond.content()
└── deprecated or removed

bond.node('content')
└── access registered Atom

createAtomInstance(...)
└── create node in component
```

---

## Phase 10: Update documentation

Update the docs from:

```text
Bond owns DOM element references via legacy Bond-owned Atom subclasses.
```

To:

```text
Atom components create Atoms.
Atoms capture their rendered elements.
Bonds coordinate registered Atoms through context.
Capabilities provide reusable behavior at the Atom and Bond levels.
```

Recommended docs pages:

```text
Core Concepts
├── Atoms
├── Atoms
├── Bonds
├── Capabilities / Particles
└── Migration Guide
```

---

# 22. Migration Checklist

## Core package

```text
[ ] Add Atom class.
[ ] Keep legacy Bond-owned Atom as deprecated compatibility wrapper.
[ ] Add createAtomInstance helper.
[ ] Add Bond.register(atom).
[ ] Add Bond.unregister(atom).
[ ] Add Bond.node(key).
[ ] Add Bond.nodes(kind).
[ ] Add capability installation API.
[ ] Add capability merge system.
[ ] Add dev warnings for conflicts.
[ ] Add required/optional bond helpers.
[ ] Add compatibility layer for existing bond.root(), bond.content(), etc.
[ ] Keep BondState as compatibility wrapper or internal helper until old code migrates.
```

## Components

```text
[ ] Convert Dialog parts to create Atoms locally.
[ ] Convert Popover parts.
[ ] Convert Dropdown parts.
[ ] Convert Select parts.
[ ] Convert Tabs parts.
[ ] Convert Accordion parts.
[ ] Convert Menu / ContextMenu parts.
[ ] Convert simple atoms last, only where useful.
```

## Capabilities

```text
[ ] openable
[ ] controllable
[ ] disabledState
[ ] dataState
[ ] pressable
[ ] focusable
[ ] dismissableLayer
[ ] focusScope
[ ] focusTrap
[ ] rovingFocus
[ ] collectionRegistry
[ ] typeahead
[ ] ariaLabelRegistry
[ ] popperPositioning
[ ] motion
```

## Docs

```text
[ ] Explain Particle / Capability concept.
[ ] Explain Atom vs Atom Component.
[ ] Explain Bond as coordinator, not factory.
[ ] Explain optional vs required bonds.
[ ] Add before/after migration examples.
[ ] Add capability authoring guide.
[ ] Add merge/conflict behavior rules.
```

## Tests

```text
[ ] Atom can exist without Bond.
[ ] Atom registers with Bond when provided.
[ ] Atom unregisters on destroy.
[ ] Multiple Atoms can register under same kind.
[ ] Single Atom duplicate registration warns.
[ ] Capabilities merge attrs predictably.
[ ] Event handlers compose predictably.
[ ] Attachments cleanup in correct order.
[ ] Existing legacy Bond-owned Atom APIs still work during compatibility period.
```

---

# 23. Compatibility Strategy

Recommended compatibility period:

```text
vNext minor
├── introduce Atom
├── keep legacy Bond-owned Atom
├── support both creation styles
└── warn only in docs, not runtime

vNext + 1
├── mark legacy Bond-owned Atom deprecated in TypeScript
├── add dev warnings for new internal use of Bond factories
└── keep public compatibility

Next major
├── remove or fully internalize legacy Bond-owned Atom
├── remove Bond-owned atom factory methods
└── require component-owned Atom creation
```

Do not immediately remove:

```text
bond.root()
bond.content()
bond.trigger()
legacy Bond-owned Atom
```

Instead, make them adapters over the new registry.

---

# 24. Example Final Dialog Shape

```text
Dialog.Root
│
├── DialogBond
│   ├── props / shared open state
│   ├── openable capability
│   ├── atomRegistry capability
│   ├── focusScope capability
│   ├── dismissableLayer capability
│   └── ariaLabelRegistry capability
│
└── context provider
```

```text
Dialog.Trigger
│
├── Atom('dialog.trigger')
│   ├── elementRef
│   ├── pressable
│   ├── dialogTrigger
│   └── dataState
│
└── HtmlAtom
```

```text
Dialog.Content
│
├── Atom('dialog.content')
│   ├── elementRef
│   ├── dialogContent
│   ├── focusScopeParticipant
│   └── motion
│
└── HtmlAtom
```

```text
Dialog.Title
│
├── Atom('dialog.title')
│   ├── elementRef
│   └── labelProvider
│
└── HtmlAtom
```

---

# 25. Final Recommended Concept

The improved concept should be described like this:

```text
Svelte Atoms has four runtime concepts:

1. Atom Component
   The Svelte component that renders the UI.

2. Atom
   The runtime atom instance created by the Atom Component.
   It owns local element behavior and can exist without a Bond.

3. Bond
   The compound controller that owns shared state and coordinates Atoms through context.
   It does not need to create Atoms.

4. Capability / Particle
   A reusable behavior unit that can attach to an Atom or Bond.
```

The new architecture is:

```text
Component owns existence.
Atom owns local behavior.
Bond owns shared state and relationships.
Capabilities own reusable behavior.
```

One-line version:

> **Atoms are the runtime atoms, capabilities are their particles, and Bonds coordinate them into compound UI molecules.**

---

# 26. Source Notes

This proposal is based on the current public Svelte Atoms concept and source shape as reviewed on 2026-06-27:

- The public docs describe Atoms and Bonds as chemistry-inspired concepts where atoms are the smallest UI units and bonds coordinate multiple atoms.
- The current Bonds docs describe a two-part architecture where `BondState` owns reactive data and `Bond` manages elements/context, with `legacy Bond-owned Atom` subclasses handling DOM-facing spreads.
- The current source exposes `Bond`, `BondState`, and `legacy Bond-owned Atom` in `src/lib/shared/bond.svelte.ts`, with `Bond` maintaining an atom queue and `legacy Bond-owned Atom` providing `attrs`, `handlers`, `attachments`, and `spread`.
- Dialog currently demonstrates the class/subclass pattern with `DialogRootAtom`, `DialogContentAtom`, `DialogTriggerAtom`, and factory methods such as `root()`, `content()`, and `trigger()` on `DialogBond`.
