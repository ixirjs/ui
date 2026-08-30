# Repository Index

> Repository-wide router and architectural map for AI agents. Follow the most relevant subordinate index before modifying a project.

## Repository overview

`@ixirjs/ui` is a single-project Svelte 5 + TypeScript UI component library and SvelteKit documentation/demo application. It is not a monorepo: the root has one `package.json`, one lockfile (`bun.lock`), one SvelteKit/Vite configuration, and no workspace manifest. The library source is under `src/lib`; the SvelteKit site, docs, demos, and MCP endpoint are under `src/routes` and `src/docs`.

Authoritative evidence: [`package.json`](package.json), [`svelte.config.js`](svelte.config.js), [`vite.config.ts`](vite.config.ts), [`src/lib/index.ts`](src/lib/index.ts), and [`src/routes/+layout.svelte`](src/routes/+layout.svelte).

## Start here

- [`AGENTS.md`](AGENTS.md) — repository authoring and architecture rules.
- [`CONTEXT.md`](CONTEXT.md) — Bond, part, model, preset, portal, and testing vocabulary.
- [`README.md`](README.md) — package purpose, consumer prerequisites, and basic development entry points.
- [`package.json`](package.json) — package exports and verified scripts.
- [`src/lib/index.ts`](src/lib/index.ts) — curated root package API.

## Project index router

This is a single project, so no subordinate indexes are required. The library, documentation site, Storybook, scripts, and tests share one build and release boundary.

| Project or subsystem | Responsibility                                                  | Index | When to read it                                          |
| -------------------- | --------------------------------------------------------------- | ----- | -------------------------------------------------------- |
| None                 | No independent project/package/service boundary was identified. | —     | Use this index and the linked source-of-truth documents. |

## Repository topology

| Path                                                                                             | Responsibility                                                                                                      | Index or source of truth                                                                                                 |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `src/lib/components/`                                                                            | Public and internal UI component families; most folders expose an `index.ts`.                                       | [`src/lib/index.ts`](src/lib/index.ts), [`AGENTS.md`](AGENTS.md)                                                         |
| `src/lib/kernel/`                                                                                | The element seam every part authors through (`Kernel.element`/`render`/`context`/`id`).                             | [`src/lib/kernel/README.md`](src/lib/kernel/README.md)                                                                   |
| `src/lib/capability/`                                                                            | Behaviour models (`createDisclosure`, `createSelection`, `createRovingFocus`, …) as plain functions.                | [`src/lib/capability/README.md`](src/lib/capability/README.md)                                                           |
| `src/lib/authoring/`                                                                             | Prop types every part declares, identity helpers, motion.                                                           | [`src/lib/authoring/README.md`](src/lib/authoring/README.md)                                                             |
| `src/lib/preset/`, `src/lib/public/`, `src/lib/attachments/`, `src/lib/runes/`, `src/lib/utils/` | Presentation presets, constrained public facades, DOM/lifecycle helpers, reactive utilities, and general utilities. | [`package.json`](package.json), [`src/lib/public/types.ts`](src/lib/public/types.ts)                                     |
| `src/docs/`                                                                                      | Documentation components, previews, markdown/LLM helpers, and docs-side utilities.                                  | [`src/docs/index.ts`](src/docs/index.ts)                                                                                 |
| `src/routes/`                                                                                    | SvelteKit pages, component documentation, demos, and the MCP HTTP endpoint.                                         | [`svelte.config.js`](svelte.config.js), [`src/routes/api/[transport]/+server.ts`](src/routes/api/[transport]/+server.ts) |
| `src/stories/`, `.storybook/`                                                                    | Storybook stories, shared story styling, and Storybook configuration.                                               | [`.storybook/main.ts`](.storybook/main.ts)                                                                               |
| `src/lib/test/`, colocated `*.spec.ts`/`*.svelte.spec.ts`, `e2e/`                                | Unit/browser tests, test-only Svelte fixtures, and Playwright end-to-end tests.                                     | [`vitest.config.ts`](vitest.config.ts), [`playwright.config.ts`](playwright.config.ts)                                   |
| `scripts/`                                                                                       | Component scaffolder, SSR benchmark build config, and the docs prop-sync helper.                                    | [`package.json`](package.json)                                                                                           |
| `docs/`                                                                                          | Architecture decisions, authoring guidance, audits, performance notes, and research.                                | [`docs/adr/0008-public-contract-and-authoring-seams.md`](docs/adr/0008-public-contract-and-authoring-seams.md)           |

## Cross-project architecture

There are no cross-project dependencies inside a monorepo. The repository has one shared dependency direction:

```text
SvelteKit routes/docs/stories ──imports──> src/lib public/component APIs
                                              │
                                              ├── components ──> kernel (the element seam)
                                              ├── preset/public facades
                                              └── capability (behaviour models), authoring (types)
```

- Component families are plain state classes on the Kernel seam; `docs/research/whiteboard-migration-recipe.md` and `CONTEXT.md` define the load-bearing vocabulary.
- The package root facade in [`src/lib/index.ts`](src/lib/index.ts) and subpath facades configured in [`svelte.config.js`](svelte.config.js) / [`package.json`](package.json) are the consumer-facing boundary.
- Presets feed component presentation; the site installs its preset in [`src/routes/+layout.svelte`](src/routes/+layout.svelte).
- Overlay components share portal/teleport/z-layer infrastructure under `src/lib/components/portal/`; see [`docs/adr/0007-portal-containment-over-top-layer-and-body-detach.md`](docs/adr/0007-portal-containment-over-top-layer-and-body-detach.md).
- The SvelteKit API route exposes documentation-oriented MCP tools and reads component docs from `src/routes/docs/components/`; it is an application integration, not a separate service package.
- `bun run build` builds the SvelteKit application, while `prepack`/the package preflight build and validate the distributable library surface. Changes to shared runtime, public facades, presets, or package exports can affect both consumers and the docs app.

## Shared development workflows

| Task                          | Command                                                    | Scope                                                                | Evidence or notes                                                                                                                 |
| ----------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Install                       | `bun install --frozen-lockfile`                            | Repository                                                           | CI uses Bun and the committed `bun.lock`.                                                                                         |
| Development site              | `bun run dev`                                              | SvelteKit app                                                        | `package.json`; long-lived process should be detached.                                                                            |
| Typecheck                     | `bun run check`                                            | SvelteKit/library TypeScript and Svelte checks                       | `package.json`.                                                                                                                   |
| Formatting check              | `bun run lint`                                             | Whole repository                                                     | Runs Prettier check and ESLint.                                                                                                   |
| Unit/browser tests            | `bunx vitest run`                                          | Vitest client and server projects                                    | [`vitest.config.ts`](vitest.config.ts).                                                                                           |
| End-to-end tests              | `bunx playwright test`                                     | `e2e/`, with build + preview web server                              | [`playwright.config.ts`](playwright.config.ts).                                                                                   |
| Build                         | `bun run build`                                            | SvelteKit application                                                | `package.json`; uses Netlify adapter via [`svelte.config.js`](svelte.config.js).                                                  |
| Package exports               | `bun run prepack`                                          | Generated package plus publication lint                              | `package.json`; invokes `svelte-kit sync`, `svelte-package`, and `publint`.                                                       |
| Scaffold a component          | `bun run scaffold <name> --slots root,header:trigger,body` | New family folder plus its preset-key registration                   | [`scripts/scaffold.mjs`](scripts/scaffold.mjs); `--static` for the Button shape, `--dry` to preview.                              |
| Convention audits             | `bun run test:unit -- --run`                               | Enforced as specs under `src/lib/test/contracts/`, not shell scripts | e.g. [`root-identity-audit.spec.ts`](src/lib/test/contracts/root-identity-audit.spec.ts).                                         |
| SSR cost and output gate      | `bun run bench:ssr`                                        | Marginal µs/card, GC share, and output fingerprint                   | [`src/lib/test/perf/ssr-bench.ts`](src/lib/test/perf/ssr-bench.ts); µs budget is machine-specific — use `-- --no-gate` elsewhere. |
| Storybook                     | `bunx storybook build`                                     | All stories discovered by [`.storybook/main.ts`](.storybook/main.ts) | `package.json`.                                                                                                                   |
| Full CI-equivalent validation | See [`.github/workflows/ci.yml`](.github/workflows/ci.yml) | Lint, check, unit/browser, e2e, prepack, Storybook, SSR fingerprint  | CI installs Chromium before browser tests; the bench job runs `--no-gate`.                                                        |

## Shared configuration and infrastructure

- [`package.json`](package.json) defines package metadata, exports (`.`, `./components/*`, `./preset`, `./utils`, `./shared`, `./experimental`, and root CSS), scripts, and dependency constraints. Svelte is a peer dependency.
- [`bun.lock`](bun.lock) is the dependency lockfile; CI uses Bun with frozen installation.
- [`svelte.config.js`](svelte.config.js) configures SvelteKit, mdsvex, Netlify adapter, aliases, and `.svelte`/`.svx` extensions.
- [`vite.config.ts`](vite.config.ts), [`tsconfig.json`](tsconfig.json), [`eslint.config.js`](eslint.config.js), [`.prettierrc`](.prettierrc), and [`.prettierignore`](.prettierignore) govern build, TypeScript, lint, and formatting.
- [`vitest.config.ts`](vitest.config.ts) separates browser/Chromium rune tests from Node tests; [`playwright.config.ts`](playwright.config.ts) owns E2E setup.
- [`.storybook/main.ts`](.storybook/main.ts) configures Storybook discovery, SvelteKit, docs, accessibility, and Vitest addons.
- [`.github/workflows/ci.yml`](.github/workflows/ci.yml) is the verified CI pipeline. Netlify deployment is implied by the configured adapter; no repository deployment workflow was found.
- Environment values are intentionally not reproduced. `.env` and `.env.*` are ignored by [`.gitignore`](.gitignore).

## Repository-wide conventions and constraints

- Follow [`AGENTS.md`](AGENTS.md) and [`CONTEXT.md`](CONTEXT.md) before changing public component modules.
- Components and directories use kebab-case; variables/functions use camelCase.
- New modules follow the static `Button` or bonded `Card`/`Accordion` anatomy. Shared state belongs on the family's state class; behaviour is composed from models; every part renders through `Kernel.element`.
- Public package surfaces are explicit. A new top-level module generally requires updates to its component facade, [`src/lib/index.ts`](src/lib/index.ts), public facade, aggregate convention, and public-surface test; consult the authoring guide for the exact list.
- Test-only Svelte files belong under `src/lib/test/` and use the `*.test.svelte` convention. Bond interface and `atom.spread` behavior are primary test surfaces.
- Do not copy legacy patterns; `AGENTS.md` marks the canonical exemplar for each module shape and names the parts that are migration debt.

## Cross-project change guide

| Change type                      | Affected indexes or projects                                                        | Validation                                                                               | Risks                                                                                          |
| -------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Kernel seam and behaviour models | `src/lib/kernel/`, `src/lib/capability/`, component families, public consumers      | Focused specs; `bun run check`; unit tests; `kernel-authoring-audit`, `public-surface`   | Presentation resolution, motion and lifecycle, cross-part ARIA, and the published surface.     |
| New or changed component API     | Component folder, `src/lib/index.ts`, `src/lib/public/`, docs/stories as applicable | Focused browser spec; `bun run prepack`; `the external component audit`; Storybook build | Export drift, preset compatibility, accessibility relationships, and package contract changes. |
| Preset or presentation resolver  | `src/lib/preset/`, atom resolver/presentation code, stories/docs styling            | Resolver tests; `bun run check`; unit tests; package export checks                       | Precedence and reactive tracking are contract-sensitive.                                       |
| Portal/overlay behavior          | `src/lib/components/portal/` and overlay families                                   | Focused component tests; E2E; Storybook build                                            | Containment, focus, escape, stacking, and nested-overlay behavior.                             |
| Docs/MCP route                   | `src/routes/docs/`, `src/docs/`, `src/routes/api/[transport]/`                      | `bun run check`; `bun run build`                                                         | Docs paths are consumed by the MCP endpoint and may be generated/served in multiple forms.     |
| Packaging or CI                  | `package.json`, configs, scripts, `.github/workflows/ci.yml`                        | Relevant script plus full CI sequence                                                    | Published exports and generated package output can diverge from source.                        |

## Generated, vendored, and ignored areas

Do not edit generated or build output directly: `node_modules/`, `.svelte-kit/`, `build/`, `dist/`, `storybook-static/`, `test-results/`, `.netlify/`, `.fallow/`, and Vite timestamp files are ignored or excluded build artifacts. Their sources are the authored files in `src/`, `scripts/`, configuration files, and package metadata. `bun.lock` is generated by dependency management but is committed and should only change as part of an intentional dependency update. No vendored source tree was identified.

## Risks and fragile boundaries

**Verified facts:** the package root exports a large explicit component/type surface; tests intentionally split browser rune tests from Node tests; CI requires Chromium, and runs lint, typecheck, unit/browser tests, e2e, `prepack`, Storybook, and the SSR output-fingerprint bench; convention audits are Vitest specs under `src/lib/test/contracts/`; portal behavior has dedicated architecture documentation; the API route constructs URLs from request origins and reads docs endpoints.

**Inference/risks:** Kernel changes are high-coupling — every family authors through `src/lib/kernel/kernel.svelte.ts`; public-facade or preset changes can affect both package consumers and the in-repository docs/stories. Generated `dist/` and SvelteKit output can make local results look stale; validate from source and use the package/export scripts. Environment- or deployment-specific behavior beyond the Netlify adapter is not established by the repository.

## Unindexed areas

None identified. This is a single project; `src/lib`, the SvelteKit site/docs, Storybook, scripts, and tests are included in this root map rather than split into independently operated indexes.

## Open questions

- The repository configures the Netlify adapter, but no deployment workflow or authoritative hosting configuration was found; deployment details are therefore not documented here.
- The MCP route has a substantial implementation, but its complete tool behavior is not summarized here; treat [`src/routes/api/[transport]/+server.ts`](src/routes/api/[transport]/+server.ts) as authoritative.
- Existing working-tree changes were present during verification; this index does not classify or modify them.

## Index maintenance

Update this index when the package boundary, workspace shape, root exports, shared runtime architecture, major source/test topology, verified workflows, deployment integration, or generated-output policy changes. Re-check all paths and commands after such changes. If the repository becomes a workspace or gains independently operated packages/services, add a root router entry and one nearest `INDEX.md` for each meaningful boundary.

_Last verified against the current working tree on 2026-07-18. No claim in this index overrides source code or executable configuration._
