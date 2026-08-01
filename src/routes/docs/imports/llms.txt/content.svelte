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

# Import Guide for @ixirjs/ui ## Application components Import application components from the root
package by default:

{codeBlock(
	`import { Button, ContextMenu, Field, Form, Input, Popover, Select } from '@ixirjs/ui';`,
	'typescript'
)}

Root imports are the most convenient choice when a module uses several components. ## Public
component subpaths Every curated facade under the {inlineCode('@ixirjs/ui/components/*')} namespace is
public. Use one when it makes an isolated component dependency clearer or when a tool requires a component-level
entry point:

{codeBlock(
	`import { Button } from '@ixirjs/ui/components/button';
import { Field } from '@ixirjs/ui/components/form/field';`,
	'typescript'
)}

Do not import private source paths such as
{inlineCode('@ixirjs/ui/dist/components/button/button.svelte')} or {inlineCode('src/lib/...')}.
Component-level imports always use the {inlineCode('@ixirjs/ui/components/*')} namespace. ## Presets and
utilities Use their dedicated public subpaths:

{codeBlock(
	`import { setPreset } from '@ixirjs/ui';
import type { Preset } from '@ixirjs/ui/preset';
import { cn, defineVariants } from '@ixirjs/ui/utils';`,
	'typescript'
)}

## Namespaced component families Compound components are namespaces regardless of whether they come
from the root or a public component subpath:

{codeBlock(
	`import { Button, Popover } from '@ixirjs/ui';

<Popover.Root>
  <Popover.Trigger base={Button}>Open</Popover.Trigger>
  <Popover.Content>Content</Popover.Content>
</Popover.Root>`,
	'svelte'
)}

## Common mistakes

{list([
	'Default imports from @ixirjs/ui; the package uses named exports.',
	'Importing from private source paths.',
	'Using a subpath that is not in the package export map.',
	'Using lowercase component names in imports.'
])}

## Valid imports

{codeBlock(
	`import { Button, Popover } from '@ixirjs/ui';
import { Button as StandaloneButton } from '@ixirjs/ui/components/button';`,
	'typescript'
)}
