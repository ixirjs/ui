<script lang="ts">
	import { FrontMatter } from '$docs/md/components';
	import { codeBlock, inlineCode, list } from '$docs/md/template';
	import type { Frontmatter } from '$docs/md/frontmatter';

	const frontmatter: Frontmatter = {
		id: 'composition',
		title: 'Component Composition',
		category: 'architecture',
		depth: 'detailed',
		prerequisites: ['philosophy', 'crafting'],
		related: ['usage', 'variants', 'motion']
	};
</script>

<FrontMatter {frontmatter} />

# Component Composition Svelte Atoms favors composition over monolithic components. ## Base
Composition with {inlineCode('base')}

{codeBlock(
	`<script lang="ts">
  import { Button, Popover } from '@svelte-atoms/core';
</script>

<Popover.Root>
  <Popover.Trigger base={Button} variant="outline">
    Open settings
  </Popover.Trigger>
  <Popover.Content>
    Settings panel
  </Popover.Content>
</Popover.Root>`,
	'svelte'
)}

## Compose forms from focused atoms

{codeBlock(
	`<script lang="ts">
  import { Field, Input } from '@svelte-atoms/core';
</script>

<Field.Root name="password">
  <Field.Label>Password</Field.Label>
  <Field.Control base={Input.PasswordControl} placeholder="••••••••" />
  <Field.HelperText>Use at least 8 characters.</Field.HelperText>
</Field.Root>`,
	'svelte'
)}

## Compose selection UIs

{codeBlock(
	`<script lang="ts">
  import { Select, Button } from '@svelte-atoms/core';
</script>

<Select.Root>
  <Select.Trigger base={Button} variant="ghost">
    <Select.Placeholder>Select a value</Select.Placeholder>
  </Select.Trigger>
  <Select.Content>
    <Select.List>
      <Select.Item value="a">Option A</Select.Item>
      <Select.Item value="b">Option B</Select.Item>
    </Select.List>
  </Select.Content>
</Select.Root>`,
	'svelte'
)}

## Composition Rules

{list([
	'Compose by behavior (trigger/content/item), not by huge prop sets.',
	'Use base={...} to inherit style and interaction from existing atoms.',
	'Keep each atom focused and reusable in multiple trees.',
	'Use snippet child APIs only when you need direct bond/state access.'
])}
