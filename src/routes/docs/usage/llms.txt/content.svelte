<script lang="ts">
	import { FrontMatter } from '$docs/md/components';
	import { codeBlock, inlineCode, list } from '$docs/md/template';
	import type { Frontmatter } from '$docs/md/frontmatter';

	const frontmatter: Frontmatter = {
		id: 'usage',
		title: 'Component Usage Patterns',
		category: 'fundamentals',
		depth: 'foundational',
		prerequisites: [],
		related: ['imports', 'composition', 'quick-reference']
	};
</script>

<FrontMatter {frontmatter} />

# Component Usage Patterns ## 1) Single component pattern Some components are used directly as a
single export:

{codeBlock(
	`<script lang="ts">
  import { Button } from '@ixirjs/ui';
</script>

<Button variant="primary">Save</Button>`,
	'svelte'
)}

## 2) Namespace atom pattern Compound components are exposed as namespaces with focused atoms:

{codeBlock(
	`<script lang="ts">
  import { Popover, Button } from '@ixirjs/ui';
</script>

<Popover.Root>
  <Popover.Trigger base={Button}>Open popover</Popover.Trigger>
  <Popover.Content>
    <p>Popover content</p>
  </Popover.Content>
</Popover.Root>`,
	'svelte'
)}

## 3) Composition via {inlineCode('base')}

Use {inlineCode('base={...}')} to layer behavior from one component into another:

{codeBlock(
	`<Popover.Trigger base={Button} class="w-full justify-start">
  Open menu
</Popover.Trigger>`,
	'svelte'
)}

## 4) Field + Input integration

{codeBlock(
	`<script lang="ts">
  import { Field, Input } from '@ixirjs/ui';
</script>

<Field.Root name="email">
  <Field.Label>Email</Field.Label>
  <Field.Control base={Input.EmailControl} placeholder="name@example.com" />
  <Field.HelperText>We'll never share your email.</Field.HelperText>
</Field.Root>`,
	'svelte'
)}

## Practical Guidelines

{list([
	'Prefer composition over large prop-driven APIs.',
	'Keep layout classes near usage; keep style systems (preset/variants) centralized.',
	'Use namespace atoms for complex UI, single exports for simple controls.',
	'Use snippet child APIs when you need access to a component bond/state object.'
])}
