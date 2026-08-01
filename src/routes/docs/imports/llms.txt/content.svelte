<script lang="ts">
	import { FrontMatter } from '$docs/md/components';
	import { codeBlock, inlineCode, list } from '$docs/md/template';
	import type { Frontmatter } from '$docs/md/frontmatter';

	const frontmatter: Frontmatter = {
		id: 'imports',
		title: 'Import Guide',
		category: 'fundamentals',
		depth: 'foundational',
		prerequisites: [],
		related: ['usage', 'quick-reference']
	};
</script>

<FrontMatter {frontmatter} />

# Import Guide for @svelte-atoms/core ## Golden Rule Import public APIs from {inlineCode(
	'@svelte-atoms/core'
)}.

{codeBlock(
	`import { Button, Popover, Select, Input, Form, Field } from '@svelte-atoms/core';`,
	'typescript'
)}

## Current Import Patterns ### Single components Use direct named exports for single components:

{codeBlock(`import { Button, Badge, Avatar, Kbd } from '@svelte-atoms/core';`, 'typescript')}

### Namespaced component families Many compound components are exported as namespaces:

{codeBlock(
	`import { Popover, Select, DropdownMenu, Input, Field } from '@svelte-atoms/core';`,
	'typescript'
)}

Then use atoms from each namespace:

{codeBlock(
	`<Popover.Root>
  <Popover.Trigger base={Button}>Open</Popover.Trigger>
  <Popover.Content>
    Content
  </Popover.Content>
</Popover.Root>`,
	'svelte'
)}

### Utilities and context helpers

{codeBlock(`import { cn, defineVariants, setPreset } from '@svelte-atoms/core';`, 'typescript')}

## Recommended Structure - Keep all package imports in one line per module. - Import types with {inlineCode(
	'import type'
)} when possible. - Prefer canonical names over deprecated aliases (for example, use {inlineCode(
	'DropdownMenu'
)} over legacy menu aliases). ## Common Mistakes

{list([
	'Default imports from @svelte-atoms/core (the package uses named exports).',
	'Importing from private source paths like src/lib/... in application code.',
	'Mixing deprecated aliases when a canonical namespace exists.',
	'Using lowercase component names in imports.'
])}

## Correct vs Incorrect

{codeBlock(
	`// Incorrect\nimport Button from '@svelte-atoms/core';\nimport { Button } from '@svelte-atoms/core/components/button';\n\n// Correct\nimport { Button, Popover } from '@svelte-atoms/core';`,
	'typescript'
)}
