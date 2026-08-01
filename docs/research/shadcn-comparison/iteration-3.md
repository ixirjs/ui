# Iteration 3 — Forms & validation story + component-coverage gaps

_Date: 2026-06-22 · Focus: the forms/validation layer (shadcn = formsnap + sveltekit-superforms + zod) and which components each catalog has that the other lacks._

## Part A — Forms & validation

### What svelte-atoms actually ships (`src/lib/components/form/`)

Better than a layout wrapper: a homegrown Field set **plus** a pluggable schema-validation core.

- **Parts:** `Field.Root`, `Field.Label`, `Field.Control`, `Field.HelperText` (the "Description" analog). `Form.Root` renders `<form>` + a `collection('field')` of child `FieldBond`s.
- **Validation engine** (`field/bond.svelte.ts`): `validate()` / `validateASync()`, `#errors`, `#isValidating`, pluggable `ValidationAdapter`. Adapters shipped: Zod (duck-typed, not a hard dep), Yup, Joi, Custom.
- **A11y wiring is good:** `role=group`, `aria-labelledby`, `aria-describedby`/`aria-errormessage` → `error-<id>`, `aria-invalid`, label↔control `for` via `labelledControl` capability.

### The honest gaps vs formsnap/superforms

| Capability                                    | shadcn (formsnap+superforms)                                           | svelte-atoms                                                                                                                             | Gap severity               |
| --------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Field/Label/Control/Description parts         | ✅                                                                     | ✅                                                                                                                                       | parity                     |
| **Field.Error render component**              | ✅ `<Form.FieldErrors>`                                                | ❌ errors computed but **never rendered**; `aria-describedby`/`errormessage` point at an id that no element emits → **dangling targets** | 🔴 high                    |
| Schema validation                             | ✅ (superforms adapters)                                               | ✅ own engine (zod/yup/joi/custom)                                                                                                       | parity-ish                 |
| **Auto-trigger validate** (submit/blur/input) | ✅                                                                     | ❌ `validate()` is **never auto-invoked**; consumer must call it manually                                                                | 🔴 high                    |
| dirty / touched / pristine tracking           | ✅                                                                     | ❌ none                                                                                                                                  | 🟠 medium                  |
| **Server / SvelteKit `enhance` integration**  | ✅ superforms `superValidate` + progressive enhancement + `$page.form` | ❌ nothing                                                                                                                               | 🔴 high (but scope choice) |
| valibot adapter                               | ✅                                                                     | ❌                                                                                                                                       | low                        |

### Rough edges flagged (not bugs to fix mid-loop, but worth a ticket)

- **Two divergent Zod adapters** with different result shapes: `ZodValidationAdapter` (`{success,data,errors}`) vs `ZodAdapter` (`{data,errors}`). Stories import `ZodAdapter`; the barrel (`index.ts`) only re-exports `ZodValidationAdapter` → public API and demos disagree.
- `validateASync` method-name typo.
- `FormBond.label()/control()/root()` are vestigial `{}` stubs.

### shadcn STRENGTHS to adopt for forms

1. **Ship a `Field.Error` (FieldErrors) part.** This is the highest-leverage fix — it makes the already-wired `aria-errormessage` targets real and gives consumers error UI for free. _Low effort, closes a 🔴 + an a11y correctness bug._
2. **Auto-wire `validate()` to lifecycle** — validate-on-submit by default, opt-in validate-on-blur/input. Right now the engine exists but does nothing until called. _Medium._
3. **Add dirty/touched/pristine** per field (formsnap-style) so consumers can show "only after touched" errors. _Medium._
4. **A superforms bridge** (optional adapter package) — let SvelteKit users feed `superValidate` results in and get progressive enhancement. shadcn's biggest forms advantage is the server story; svelte-atoms could meet it with a thin optional integration rather than reinventing it. _High effort, high differentiation._
5. **valibot adapter** — cheap parity. _Low._

### Where svelte-atoms already wins

- **Validation is framework-agnostic and built in** — no need to pull formsnap + superforms + zod as 3 separate installs. Adapters are duck-typed so zod isn't a hard dep.
- **Field bonds participate in the same capability/atom system** as everything else (uniform a11y, presets), whereas formsnap is a separate mental model bolted onto shadcn.

## Part B — Component-coverage diff

**svelte-atoms has, shadcn lacks:** `chip`, `container`, `stack`, `swatch`, `stepper`, `tree`, `qr-code`, `image`, `kbd`, `link`, `list`, `popover-dialog`, `icon`. (Richer primitives/layout + a real Tree.)

**shadcn has, svelte-atoms lacks (candidate roadmap):**

| shadcn component          | svelte-atoms status                      | Recommendation                                           |
| ------------------------- | ---------------------------------------- | -------------------------------------------------------- |
| **Skeleton**              | missing                                  | 🟢 easy + high demand — add a loading-skeleton primitive |
| **Toggle / Toggle Group** | missing (has switch/chip)                | 🟢 easy — common, maps to existing patterns              |
| **Pagination**            | missing                                  | 🟢 medium — pairs with datagrid                          |
| **Command** (palette)     | missing (has combobox/menu)              | 🟡 medium — compose from combobox + list + dialog        |
| **Carousel**              | missing                                  | 🟡 medium                                                |
| **Resizable**             | missing                                  | 🟡 medium                                                |
| **Menubar**               | missing (has menu/dropdown-menu)         | 🟡 medium — compose from existing menu                   |
| **Navigation Menu**       | missing                                  | 🟡 medium                                                |
| **Hover Card**            | missing (has tooltip/popover)            | 🟢 easy — compose from popover + hover trigger           |
| **Aspect Ratio**          | missing                                  | 🟢 trivial                                               |
| **Chart**                 | missing                                  | 🟡 large (shadcn wraps a chart lib) — likely skip        |
| **Alert Dialog**          | has `dialog` (compose)                   | 🟢 add a thin confirm-dialog preset/fuse                 |
| **Range Calendar**        | calendar range mode **dead** (known bug) | 🟠 fix existing rather than add                          |
| **Input OTP**             | exists as input variant (`otp`)          | ✅ already covered                                       |

**Naming/equivalences (not gaps):** Separator≈`divider`, Sheet≈`drawer`, Scroll Area≈`scrollable`, Table≈`datagrid`/`list`, Sonner≈`toast`.

### Quick wins from the coverage diff

1. **Skeleton** — easy, universally expected. ⭐
2. **Toggle / Toggle Group** — easy, fills an obvious gap. ⭐
3. **Aspect Ratio** + **Hover Card** — trivial/easy composes. ⭐
4. **Alert Dialog** as a fuse/preset over `dialog`. ⭐
5. **Pagination** to complete the datagrid story.

## Open threads for next iterations

- [ ] Documentation site & examples breadth/quality (shadcn docs are a major adoption asset).
- [ ] Realistic bundle-size slice (single Button import → tree-shake reality, dep cost).
- [ ] Theming: dark mode + multi-theme switching + the registry/theme generator shadcn ships.
- [ ] Variant ergonomics: `defineVariants` vs `tailwind-variants`/cva usage in shadcn.
- [ ] Fix-vs-add: the dead calendar range mode (known bug) blocks Range Calendar parity.
