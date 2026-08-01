<script lang="ts">
	import { FrontMatter } from '$docs/md/components';
	import { codeBlock, list, newLine } from '$docs/md/template';

	let { data } = $props();
	const { metadata, frontmatter } = $derived(data);
</script>

<FrontMatter {frontmatter} />

# {metadata.pageTitle}

{metadata.pageDescription}

## What Are Atoms? In chemistry, atoms are the basic units that combine to form molecules. In Svelte
Atoms, the same principle applies: atom UI components are the fundamental pieces that combine to
create more complex UI patterns. Unlike traditional component libraries that only provide
fully-featured components, atom UI primitives give you raw building blocks. Runtime Atom classes
handle node-level behavior and integration while the UI component keeps you in control of structure
and styling.{newLine(2)}## Atom UI vs Atom Class

{#each metadata.terminology as item, i (i)}
	### {item.term}

	{item.description}
{/each}

{newLine()}## Core Concepts

{#each metadata.concepts as concept, i (i)}
	### {concept.title}

	{concept.description}
{/each}

### Key Features

{list(metadata.anatomyExample.features.map((f) => `**${f.label}**: ${f.description}`))}

## Anatomy of an Atom Here's how an atom works with a simple example:

{codeBlock(metadata.examples.anatomy, 'svelte')}

## When to Use Atoms

{#each metadata.whenToUse as use, i (i)}
	### {use.category}

	{use.description}

	**Examples:**
	{list(use.examples)}
{/each}

## Atoms vs Full Components ### Atoms

{list(metadata.atomsVsComponents.atoms.features.map((f) => `**${f.positive}**: ${f.text}`))}

**Use atoms when:** - You need maximum flexibility - Your design system is unique - You want
complete control over markup - You're building custom component patterns - You want to understand
how things work ### Full Components

{list(metadata.atomsVsComponents.components.features.map((f) => `**${f.positive}**: ${f.text}`))}

**Use full components when:** - You want to move quickly - You're okay with opinionated defaults -
You need common patterns out of the box - You prefer convention over configuration ## Available
Atoms

{#each metadata.availableAtoms as atom, i (i)}
	### {atom.name}

	{atom.description}
{/each}

## Getting Started with Atoms ### 1. Import an Atom

{codeBlock(
	`
import { HtmlAtom } from '@svelte-atoms/core';
`,
	'typescript'
)}

### 2. Define Variants (Optional)

{codeBlock(
	`
import { defineVariants } from '@svelte-atoms/core/utils';

const buttonVariants = defineVariants({
  variants: {
    variant: {
      primary: { class: 'bg-primary text-primary-foreground' },
      secondary: { class: 'bg-secondary text-secondary-foreground' }
    },
    size: {
      sm: { class: 'px-3 py-1 text-sm' },
      md: { class: 'px-4 py-2 text-base' },
      lg: { class: 'px-6 py-3 text-lg' }
    }
  },
  defaults: {
    variant: 'primary',
    size: 'md'
  }
});
`,
	'typescript'
)}

### 3. Use the Atom

{codeBlock(
	`
<HtmlAtom
  as="button"
  variants={buttonVariants}
  variant="primary"
  size="lg"
  class="rounded-md font-semibold"
>
  Click me
</HtmlAtom>
`,
	'svelte'
)}

## Examples ### Custom Button Component

{codeBlock(metadata.examples.customButton, 'svelte')}

### Custom Card Component

{codeBlock(metadata.examples.customCard, 'svelte')}

### Using with Presets

{codeBlock(metadata.examples.presetUsage, 'svelte')}
