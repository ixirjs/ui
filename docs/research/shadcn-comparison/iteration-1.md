# Iteration 1 — Distribution model & high-level architecture

_Date: 2026-06-22 · Focus: how the two libraries are shipped, authored, and themed at the macro level._

## Side-by-side

| Axis                | shadcn-svelte                                                                      | @svelte-atoms/core                                                                                        |
| ------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Distribution**    | Copy-paste source you own (CLI vendors files into your repo via `components.json`) | Installed, versioned npm package (`@svelte-atoms/core`, ships compiled `dist/`)                           |
| **CLI**             | `shadcn-svelte` CLI: `init`, `add <component>`, registry/MCP                       | None                                                                                                      |
| **Ownership**       | Consumer owns + edits the source freely                                            | Consumer consumes the public API; source stays in the package                                             |
| **Theming**         | shadcn oklch CSS-variable tokens + Tailwind                                        | **Same** oklch token DNA (`root.css`) + Tailwind v4 — _plus_ a context-driven preset registry layer       |
| **Runtime deps**    | ~zero (vendored snippets, bits-ui under the hood)                                  | Heavy/opinionated: `@floating-ui/dom`, `motion`, `date-fns`, `es-toolkit`, `lucide-svelte`, MCP SDK, etc. |
| **Component model** | Per-component snippet files; logic from `bits-ui` primitives                       | Class-based **Bond / BondState / legacy Bond-owned Atom / Capability** runtime + context                  |
| **Svelte**          | 5                                                                                  | 5-only (runes, snippets, `$bindable`)                                                                     |
| **Breadth**         | Large, well-known catalog                                                          | ~55 components, comparable breadth                                                                        |

## shadcn-svelte STRENGTHS worth borrowing

1. **The `add` CLI / registry model is the single biggest adoption lever.** Even as an npm lib, svelte-atoms could ship a `registry.json` + a thin `npx @svelte-atoms/add <component>` that scaffolds a _preset config_ (not source) into the consumer's project. Lowers the "blank unstyled component" cliff.
2. **Zero-runtime-dependency ethos.** shadcn pushes deps to the edges. svelte-atoms bundles `motion`, `date-fns`, MCP SDK, etc. Audit which of these can become **optional peer deps / lazy imports** so a consumer who only wants `Button` doesn't pay for `@qrcode-js` + `date-fns`.
3. **`components.json` as a project-level config contract.** A documented, discoverable config file (token map, preset module, alias paths) gives consumers a clear "here's where my customization lives" anchor. svelte-atoms' preset registry is powerful but less discoverable.
4. **Ownership = trust.** Consumers who can read/edit the source debug faster and feel safer. svelte-atoms can approximate this with **excellent source maps, unminified dist, and an "eject a component to source" escape hatch.**

## shadcn-svelte LIMITATIONS svelte-atoms already beats (keep/lean in)

1. **No upgrade path** — once vendored, snippets drift; bug fixes don't propagate. svelte-atoms' versioned package means consumers get fixes via `npm update`. **Lean into this: changelog discipline + semver guarantees as a selling point.**
2. **Logic lives in a third party (`bits-ui`)** — shadcn is really styling + bits-ui behavior. svelte-atoms owns the full a11y/behavior stack via Bonds/Capabilities → one coherent mental model, no two-library debugging.
3. **Duplication across projects** — every shadcn consumer re-vendors and re-patches. svelte-atoms' preset layering + context sharing centralizes that.
4. **Theming is global-token only** — shadcn tokens are essentially global CSS vars. svelte-atoms' **per-slot, context-scoped, function-of-bond presets** are strictly more expressive (e.g. theme a dialog differently per subtree).

## Action candidates for svelte-atoms (ranked)

1. **Add a scaffolding CLI** that writes preset configs + token files (mimic `shadcn add`, but config-not-source). _High impact, medium effort._
2. **Dependency diet**: move `qr-code`, `calendar/date-picker` (`date-fns`), `motion` behind optional peers / dynamic imports. _High impact._
3. **Ship a `components.json`-style config contract** for discoverable theming. _Medium._
4. **"Eject to source" escape hatch** to capture shadcn's ownership/trust benefit without abandoning the package model. _Medium, differentiating._
5. **Market the upgrade-path + single-mental-model advantages** explicitly in README (these are real wins over shadcn). _Low effort._

## Open threads for next iterations

- [ ] Per-component a11y depth comparison (keyboard, focus traps, ARIA) — shadcn/bits-ui vs Bond capabilities.
- [ ] DX of customizing one component end-to-end in each library.
- [ ] Documentation site & examples quality.
- [ ] Form handling / validation story.
- [ ] Bundle-size of a realistic app slice.
