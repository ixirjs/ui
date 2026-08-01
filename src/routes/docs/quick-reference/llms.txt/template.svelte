<script lang="ts">
	import { codeBlock, inlineCode, list } from '$docs/md/template';
	import { FrontMatter } from '$docs/md/components';
	import type { Frontmatter } from '$docs/md/frontmatter';

	const frontmatter: Frontmatter = {
		id: 'quick-reference',
		title: 'Quick Reference',
		category: 'fundamentals',
		depth: 'foundational',
		prerequisites: ['quick-start'],
		related: ['imports', 'styling']
	};
</script>

<FrontMatter {frontmatter} />

# Quick Reference ## Imports Import public components from {inlineCode('@ixirjs/ui')}. Use the
matching package subpath only when you intentionally want a narrower import boundary.

{codeBlock(`import { Button, Dialog, Popover, Select } from '@ixirjs/ui';`, 'typescript')}

{list([
	'Use a direct component such as `<Button>` or `<Checkbox>` when the component has one rendered part.',
	'Use a namespace such as `<Popover.Root>` when a component family has coordinated parts.',
	'Use `@ixirjs/ui/preset`, `@ixirjs/ui/shared`, and `@ixirjs/ui/utils` for their documented public helpers.'
])}

## Basic patterns ### Direct component

{codeBlock(
	`<script lang="ts">
  import { Button } from '@ixirjs/ui';
</script>

<Button onclick={() => save()}>Save</Button>`,
	'svelte'
)}

### Compound component

{codeBlock(
	`<script lang="ts">
  import { Button, Popover } from '@ixirjs/ui';
</script>

<Popover.Root>
  <Popover.Trigger base={Button}>More actions</Popover.Trigger>
  <Popover.Content class="p-4">Actions go here.</Popover.Content>
</Popover.Root>`,
	'svelte'
)}

### Controlled state

{codeBlock(
	`<script lang="ts">
  import { Button, Dialog } from '@ixirjs/ui';

  let open = $state(false);
</script>

<Button onclick={() => (open = true)}>Open dialog</Button>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Title>Settings</Dialog.Title>
    <Button onclick={() => (open = false)}>Close</Button>
  </Dialog.Content>
</Dialog.Root>`,
	'svelte'
)}

## Component shapes | Component | Public shape | Minimal usage | | --- | --- | --- | | Button |
Direct | {inlineCode('<Button>Save</Button>')} | | Checkbox | Direct | {inlineCode(
	'<Checkbox bind:checked />'
)} | | Radio | Direct | {inlineCode('<Radio value="one" />')} | | Input | Namespace | {inlineCode(
	'<Input.Root><Input.TextControl /></Input.Root>'
)} | | Textarea | Namespace | {inlineCode('<Textarea.Root><Textarea.Control /></Textarea.Root>')} | |
Card | Namespace | {inlineCode('<Card.Root><Card.Body>…</Card.Body></Card.Root>')} | | Select | Namespace
| {inlineCode('<Select.Root><Select.Trigger /><Select.Content /></Select.Root>')} | | Popover | Namespace
| {inlineCode('<Popover.Root><Popover.Trigger /><Popover.Content /></Popover.Root>')} | | Dialog | Namespace
| {inlineCode('<Dialog.Root><Dialog.Content /></Dialog.Root>')} | | Tabs | Namespace + item namespace
| {inlineCode('<Tabs.Root><Tab.Root /></Tabs.Root>')} | | Accordion | Root component + item namespace
| {inlineCode('<Accordion><AccordionItem.Root /></Accordion>')} | Refer to each component page for required
descendants, supported props, and accessibility behavior. ## Styling Add classes to the rendered component
or part; classes passed later in the presentation cascade win.

{codeBlock(
	`<Button class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
  Save
</Button>

<Dialog.Content class="max-w-lg p-6">
  …
</Dialog.Content>`,
	'svelte'
)}

Define reusable presentation with presets:

{codeBlock(
	`import { setPreset } from '@ixirjs/ui/preset';

setPreset({
  button: () => ({
    class: 'rounded px-4 py-2 font-medium',
    variants: {
      variant: {
        primary: { class: 'bg-primary text-primary-foreground' },
        outline: { class: 'border border-border' }
      }
    }
  })
});`,
	'typescript'
)}

## Common mistakes

{list([
	'Use named imports; the package has no default component export.',
	'Do not import private `src/lib/...` paths from an application.',
	'Do not add `.Root` to direct components such as `Button`, `Checkbox`, `Radio`, `Badge`, or `Divider`.',
	'Use the component’s documented namespace: `Select`, not an undeclared `Dropdown` alias.',
	'Import the public foundation stylesheet from `@ixirjs/ui/styles/root.css`; `styles/tw` and `styles/internal.css` are not package exports.'
])}
