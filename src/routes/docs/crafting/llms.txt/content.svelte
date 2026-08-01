<script lang="ts">
	import { FrontMatter } from '$docs/md/components';
	import { codeBlock, inlineCode, list } from '$docs/md/template';
	import type { Frontmatter } from '$docs/md/frontmatter';

	const frontmatter: Frontmatter = {
		id: 'crafting',
		title: 'Crafting Components from Scratch',
		category: 'architecture',
		depth: 'detailed',
		prerequisites: ['philosophy', 'imports'],
		related: ['composition', 'variants', 'motion', 'styling']
	};
</script>

<FrontMatter {frontmatter} />

# Crafting Components from Scratch ## Build in layers 1. Start with behavior and semantics. 2.
Expose a small public API. 3. Add variants and preset integration. 4. Add motion only when it
improves UX. ## Minimal component skeleton

{codeBlock(
	`<script lang="ts">
  import { HtmlAtom } from '@ixirjs/ui';
import { defineVariants } from '@ixirjs/ui/utils';

  const badgeVariants = defineVariants({
    class: 'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium',
    variants: {
      tone: {
        neutral: 'bg-muted text-foreground',
        success: 'bg-emerald-600 text-white',
        danger: 'bg-red-600 text-white'
      }
    },
    defaults: {
      tone: 'neutral'
    }
  });

  let { tone = 'neutral', class: klass, children, ...rest } = $props();
</script>

<HtmlAtom
  as="span"
  preset="badge"
  variants={badgeVariants}
  {tone}
  class={klass}
  {...rest}
>
  {@render children?.()}
</HtmlAtom>`,
	'svelte'
)}

## Compound component checklist For multi-part components (for example popovers, menus, drawers):

{list([
	'Provide a Root atom that owns state and context.',
	'Expose focused child atoms (Trigger, Content, Item, etc.).',
	'Share state via a bond/context object, not prop drilling.',
	'Keep each child usable with base={...} composition.'
])}

## Import and naming guidelines - Export public APIs from {inlineCode('@ixirjs/ui')}. - Use
kebab-case filenames. - Use PascalCase component symbols and camelCase helpers. ## Common pitfalls

{list([
	'Overloading components with too many one-off props.',
	'Hardcoding styles instead of using variants + preset.',
	'Using internal source imports in app code.',
	'Skipping accessibility states and ARIA attributes.'
])}
