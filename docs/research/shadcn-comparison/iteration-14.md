# Iteration 14 — TypeScript inference quality & type-safety DX

_Date: 2026-06-22 · Focus: consumer-facing type safety and autocomplete vs shadcn's trivial closed-props model. shadcn components are plain Svelte components — every prop is closed, typos always error, `bind:value` infers. svelte-atoms has a generic Bond/State/Atom system; does that machinery cost the consumer?_

## Headline: solid where authored carefully, but **excess-property checking is OFF for 17/22 components** 🔴

This is the dominant TS-DX gap vs shadcn and the single highest-leverage fix.

### The root cause

`ElementProps` carries an open index signature — `element/types.ts:70`: `[key: string]: unknown;`. Every component built on `HtmlAtomProps` inherits it. Result: **17 of 22 roots** (Button, Datagrid, Tabs, Input, Form, Accordion, Card, Combobox, Drawer, …) **silently accept unknown props**:

```svelte
<Button variannt="primary" />
<!-- typo: NO error, absorbed as unknown, spread to DOM -->
<Datagrid totallyMadeUp={1} />
<!-- NO error -->
```

Declared props (`type`, `variant`, `value`) still autocomplete and value-check — but the typo safety net is gone. shadcn catches every one of these.

The **5 plain-interface roots** (Select, Calendar, DatePicker, Popover, Scrollable) have **no index signature → full excess-property checking** — and svelte-check _does_ catch typos there (e.g. `'id' does not exist in type SelectRootProps`). So the fix is proven to work; it's just not applied library-wide.

### The trade-off (why it's there, and the path)

The index signature exists to let arbitrary DOM attributes pass through and spread. But components already type HTML attrs explicitly — `button.svelte:12`: `ButtonProps & HTMLAttributes<HTMLButtonElement>`. So `HTMLAttributes<E>` likely **already covers** the legitimate pass-through, making `[key:string]:unknown` largely redundant _and_ harmful. → **Remove/narrow the index signature** (rely on `HTMLAttributes<E>` + `data-*`/`aria-*` which TS already allows) to turn excess-property checking back on across the library. ⭐⭐ Needs a careful sweep but it's the biggest consumer-DX win available.

## Other consumer-facing leaks

| #   | Leak                                                                       | File                                                                                  | Impact                                                                                                                 |
| --- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| A   | **`SelectRootProps<T = any>`** — default `any`, plus `as T[]` bridge casts | `select/types.ts:21`, `select-root.svelte:33-47`                                      | `<Select bind:value>` gives `value: any` unless you manually write `<Select<MyType>>`. shadcn infers this for free. 🔴 |
| B   | **Tabs content snippet is `TabBond<unknown>`**                             | `tabs/types.ts:14-16`                                                                 | inside a tab body the bond's `T` is lost (datagrid threads `T` correctly; tabs doesn't)                                |
| C   | **`InputControlDetail.value?: any`**                                       | `input/types.ts:53,64`                                                                | `onchange` callbacks receive `value: any`                                                                              |
| D   | **`data?: any`** on accordion-item/collapsible/tree                        | respective `types.ts`                                                                 | user payloads typed `any` — could be a generic `T` like datagrid                                                       |
| E   | **`(string & {})` escape hatches (7 sites)**                               | preset key `preset.svelte.ts:197`, `as` tag `element/types.ts:49`, portal ids, zlayer | typos pass: `preset="buton"`, `as="dvi"` type-check fine (ties to iter-13's preset-key gap)                            |

## Where svelte-atoms's types are GOOD (keep)

- **Generic bond facade threads `T` correctly** into datagrid row/column/cell snippets with brand-preserving types — genuinely impressive, no `@ts-ignore` needed.
- **Zero `@ts-expect-error`/`@ts-ignore` in `src/lib`**; only **40 `:any` + 3 `as any`, ~30 internal kernel plumbing** (acceptable variadic-ctor machinery).
- **`exactOptionalPropertyTypes: true`** is on and enforced (catches real `string | undefined` mismatches).
- **svelte-check clean in `src/lib`** (the 19 errors are docs-site `src/routes/**` only — several are the type system _correctly_ catching misuse).
- Polymorphic `as` → `HTMLElementTagNameMap` mapping is well done with literal tags.

## shadcn comparison verdict

shadcn wins on **typo safety + zero-effort `bind:value` inference** purely because plain closed-props are simpler. svelte-atoms wins on **generic data-flow typing** (datagrid `T`) that shadcn doesn't even attempt. The gap is **not** the generic architecture (that's well-built and author-only); it's **two fixable leaks**: the global index signature and Select's `T = any`.

## Roadmap deltas (feed into iter-12 v2)

| #    | Action                                                                                                          | Tier | Effort                          |
| ---- | --------------------------------------------------------------------------------------------------------------- | ---- | ------------------------------- |
| 14.1 | **Remove/narrow `ElementProps` `[key:string]:unknown`** → restore excess-property checking lib-wide             | 1    | medium ⭐⭐ (biggest TS-DX win) |
| 14.2 | **`SelectRootProps<T = unknown>`** + thread `T` to `bind:value`/`onchange` (drop the `any` default)             | 1    | medium ⭐                       |
| 14.3 | Thread `T` into Tabs content snippet (`TabBond<T>` not `unknown`); generic `data` on accordion/collapsible/tree | 2    | medium                          |
| 14.4 | Pair preset-key `(string & {})` with the DEV warn from iter-13 (type can't catch it; runtime can)               | 1    | low                             |

## Meta-pattern (now 4 iterations running)

Same shape: the hard architecture is sound; the gaps are **a couple of over-broad types and one un-narrowed escape hatch**. 14.1 is the rare _medium_-effort item with outsized payoff — it flips typo-safety on for the whole library at once.

## Open threads remaining

- [ ] Runtime cost of the bond/context model at scale (many components/page) vs shadcn static markup — the last untouched major thread.
- [ ] Whether to do a final "study complete" synthesis once runtime-at-scale is covered.
