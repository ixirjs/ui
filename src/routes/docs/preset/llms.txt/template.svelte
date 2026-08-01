<script lang="ts">
	import { codeBlock, list, inlineCode } from '$docs/md/template';
	import { FrontMatter } from '$docs/md/components';

	let { data } = $props();
	const { metadata, frontmatter } = $derived(data);
</script>

<FrontMatter {frontmatter} />

# {metadata.pageTitle}

{metadata.pageDescription}

## Overview

{metadata.overview}

{list(metadata.keyFeatures)}

## Install a preset Preset context is installed during component initialization. Nested providers
merge with their parent. Runtime reactivity comes from state read inside an entry callback, not from
calling `setPreset` again in an effect.

{codeBlock(
	`<script lang="ts">
  import { definePreset, setPreset } from '@ixirjs/ui/preset';

  setPreset(definePreset({
    button: () => ({
      class: 'rounded-md px-4 py-2 font-semibold',
      attrs: { 'data-component': 'button' },
      variants: {
        size: {
          sm: { class: 'h-8 px-3' },
          lg: { class: 'h-12 px-6' }
        }
      },
      defaults: { size: 'sm' }
    })
  }));
</script>`,
	'svelte'
)}

## Reactive entries An entry receives one extensible context record. Reads made inside the callback
are tracked by the presentation kernel.

{codeBlock(
	`const theme = definePreset({
  'accordion.item.header': ({ bond }) => ({
    class: bond?.isOpen ? 'font-semibold text-primary' : 'text-muted-foreground',
    attrs: { 'data-open': bond?.isOpen ? '' : undefined }
  })
});`,
	'typescript'
)}

## Closed record A preset entry returns only: - `class` - `attrs` - `variants` - `compounds` -
`defaults` - `render` for deliberate renderer substitution DOM attributes belong under `attrs`.
Presets do not own lifecycle attachments; use capabilities for behavior. ## Fallback versus merging
Plain arrays have no preset semantics. Use named operations so intent is unambiguous.

{codeBlock(
	`import { fallbackPreset, mergePresetLayers, type PresetEntry } from '@ixirjs/ui/preset';

const key = fallbackPreset('button'); // first registered key

const entry = () => mergePresetLayers(
  { class: 'rounded-md' },
  { attrs: { 'data-layer': 'local' } }
);`,
	'typescript'
)}

## Class precedence Preset classes are inserted automatically. No `{inlineCode('$preset')}` sentinel
is part of the public interface. Component and consumer classes are applied after preset classes, so
local classes win conflicts. ## Custom keys Augment the canonical preset module and keep application
keys namespaced.

{codeBlock(
	`declare module '@ixirjs/ui/preset' {
  interface PresetModuleMap {
    'app.command-palette': PresetEntry;
  }
}`,
	'typescript'
)}

## Public interface - `definePreset(preset)` — checks keys and preserves precise inference. -
`setPreset(preset)` — installs and merges context during initialization. - `fallbackPreset(...keys)`
— selects the first registered key. - `mergePresetLayers(...records)` — merges every record in
order. - `PresetEntry` — `(context: PresetContext) => PresetEntryRecord`.
