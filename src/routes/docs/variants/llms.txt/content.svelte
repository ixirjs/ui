<script lang="ts">
	import { FrontMatter } from '$docs/md/components';
	import { codeBlock, inlineCode, list } from '$docs/md/template';
	import type { Frontmatter } from '$docs/md/frontmatter';

	const frontmatter: Frontmatter = {
		id: 'variants',
		title: 'Variants System',
		category: 'styling',
		depth: 'intermediate',
		prerequisites: ['styling'],
		related: ['preset', 'motion']
	};
</script>

<FrontMatter {frontmatter} />

# Variants System The current variants API is {inlineCode('defineVariants')} from {inlineCode(
	'@svelte-atoms/core'
)}. ## Basic variant definition

{codeBlock(
	`import { defineVariants } from '@svelte-atoms/core';

const buttonVariants = defineVariants({
  class: 'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  variants: {
    variant: {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
      ghost: 'hover:bg-accent hover:text-accent-foreground'
    },
    size: {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4',
      lg: 'h-12 px-6 text-lg'
    }
  },
  defaults: {
    variant: 'primary',
    size: 'md'
  }
});`,
	'typescript'
)}

## Applying variants in a component

{codeBlock(
	`<script lang="ts">
  import { HtmlAtom, defineVariants } from '@svelte-atoms/core';

  const variants = defineVariants({
    class: 'rounded-md',
    variants: {
      tone: {
        neutral: 'bg-muted text-foreground',
        success: 'bg-emerald-600 text-white'
      }
    },
    defaults: { tone: 'neutral' }
  });

  let { tone = 'neutral', ...rest } = $props();
</script>

<HtmlAtom {rest} variants={variants} {tone}>
  {@render children?.()}
</HtmlAtom>`,
	'svelte'
)}

## Compound variants

{codeBlock(
	`const variants = defineVariants({
  variants: {
    variant: { primary: '...', outline: '...' },
    size: { sm: '...', lg: '...' }
  },
  compounds: [
    {
      variant: 'primary',
      size: 'lg',
      class: 'shadow-md'
    }
  ]
});`,
	'typescript'
)}

## Preset Integration Use {inlineCode('setPreset')} for global defaults and keep per-component variants
local:

{codeBlock(
	`import { setPreset } from '@svelte-atoms/core';

setPreset({
  button: () => ({
    class: 'font-semibold tracking-wide'
  })
});`,
	'typescript'
)}

## Best Practices

{list([
	'Use defineVariants, not legacy createVariant utilities.',
	'Keep defaults minimal and explicit.',
	'Use compound variants for combined states only.',
	'Prefer semantic variant names (tone, intent, size) over visual-only names.'
])}
