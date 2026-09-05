# `preset`

**What a preset is, what ships by default, and how a tree gets one.** A data module: it defines the
shape and the built-in keys, and holds the context a component reads its preset from. It does not
resolve anything — turning a preset into classes is [`kernel/resolve`](../kernel/resolve)'s job, and
the dependency runs that way only.

| File                | Owns                                                                        |
| ------------------- | --------------------------------------------------------------------------- |
| `types.ts`          | `Preset`, `PresetEntry`, `PresetKey`, `PresetLike`, the motion types        |
| `default.ts`        | the built-in preset                                                         |
| `manifest.ts`       | `BUILT_IN_PRESET_KEYS` — the closed union every fallback key must appear in |
| `context.svelte.ts` | `getPreset` / `setPreset` / `definePreset` / `mergePreset`                  |
| `index.ts`          | the layer barrel                                                            |

`context.svelte.ts` was its own top-level `src/lib/context/` directory holding exactly one thing,
and that thing was the preset context. A directory for one file is a boundary that is not there.

## Two things to know

- **`PresetKey` is a closed union.** A new family's keys must be registered in `manifest.ts` or the
  code will not compile — `scripts/scaffold.mjs` does this automatically, and `manifest.spec.ts`
  fails any unregistered fallback.
- **Preset-driven props are never declared in the library.** A preset is swappable, so only the
  application knows which values its own preset defines; a union here would wrongly reject them.
  Consumers declare them by declaration merging — see the "Consumer prop typing" section of
  `AGENTS.md` and `props-augmentation.type-test.ts`.

The `'$preset'` sentinel inside a `class` array is replaced with the resolved preset classes. Order
is `[base, '$preset', consumer class]` — base first, the consumer's own class last so it wins.

Installed composition pairs are immutable configuration; their factory results are not. Context keeps
weak pair metadata so Kernel can prepare the outer merge once, invoke both factories on every read,
and avoid an intermediate layer wrapper. Public entry calls retain the original merged-layer shape.
No application factory is classified as static, and mutable records/getters remain supported.
