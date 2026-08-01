<script lang="ts">
	/* eslint-disable @typescript-eslint/no-unused-vars */
	import { codeBlock, inlineCode } from '$docs/md/template';
	import { FrontMatter } from '$docs/md/components';

	let { data } = $props();
	const { metadata, frontmatter } = $derived(data);
</script>

<FrontMatter {frontmatter} />

# {metadata.pageTitle}

{metadata.pageDescription}

## Requirements

{#each metadata.requirements as requirement (requirement.requirement)}
	### {requirement.requirement}

	**Version:** {requirement.version}

	{requirement.description}
{/each}

## Installation

{codeBlock(
	`# npm
npm install @ixirjs/ui

# pnpm
pnpm add @ixirjs/ui

# yarn
yarn add @ixirjs/ui

# bun
bun add @ixirjs/ui`,
	'bash'
)}

## Configuration ### 1. Import foundation styles Import the public foundation stylesheet before your
application stylesheet:

{codeBlock(
	`<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '@ixirjs/ui/styles/root.css';
  import '../app.css';
  import { defaultPreset, setPreset } from '@ixirjs/ui/preset';
  import { preset } from '../preset';

  setPreset(defaultPreset);
  setPreset(preset);

  let { children } = $props();
</script>

{@render children?.()}`,
	'svelte'
)}

### 2. Configure Tailwind CSS v4 Use Tailwind v4's CSS-first setup. The {inlineCode('@source')} directive
lets Tailwind scan utility classes shipped by {inlineCode('@ixirjs/ui')}; do not add a Tailwind v3 {inlineCode(
	'content'
)} array for this setup.

{codeBlock(
	`/* src/app.css */
@import 'tailwindcss';
@source './../node_modules/@ixirjs/ui/**/*.{js,ts,svelte}';

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --border: oklch(0.922 0 0);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-border: var(--border);
}`,
	'css'
)}

### 3. Add component presets

{codeBlock(
	`// src/preset.ts
import type { Preset } from '@ixirjs/ui/preset';

export const preset: Partial<Preset> = {
  button: () => ({
    class: 'inline-flex items-center justify-center rounded-md px-3 py-2 font-medium'
  }),
  card: () => ({
    class: 'rounded-lg border bg-card text-card-foreground shadow-sm'
  }),
  'card.header': () => ({ class: 'p-6 pb-0' }),
  'card.title': () => ({ class: 'text-xl font-semibold' }),
  'card.content': () => ({ class: 'p-6' })
};`,
	'typescript'
)}

## Your first component

{codeBlock(
	`<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { Button, Card } from '@ixirjs/ui';

  let count = $state(0);
</script>

<Card.Root class="mx-auto mt-8 max-w-md">
  <Card.Header>
    <Card.Title>Welcome to Ixir UI</Card.Title>
  </Card.Header>
  <Card.Content>
    <p class="mb-4 text-muted-foreground">Your setup is ready.</p>
    <Button onclick={() => count += 1}>Clicked {count} times</Button>
  </Card.Content>
</Card.Root>`,
	'svelte'
)}

## Form example

{codeBlock(
	`<script lang="ts">
  import { Button, Field, Form, Input } from '@ixirjs/ui';

  let email = $state('');

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    // Submit email here.
  }
</script>

<Form onsubmit={handleSubmit}>
  <Field.Root name="email" bind:value={email}>
    <Field.Label>Email</Field.Label>
    <Input.Root>
      <Field.Control base={Input.EmailControl} bind:value={email} />
    </Input.Root>
    <Field.HelperText>We'll never share your email.</Field.HelperText>
  </Field.Root>

  <Button type="submit">Submit</Button>
</Form>`,
	'svelte'
)}

## Next steps - [Browse components](/docs/components) - [Learn about presets](/docs/preset) - [Read
the styling guide](/docs/styling)
