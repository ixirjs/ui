# @svelte-atoms/core

A modular, accessible Svelte 5 UI component library built on a Bond architecture.

[![npm version](https://img.shields.io/npm/v/@svelte-atoms/core.svg)](https://www.npmjs.com/package/@svelte-atoms/core)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/svelte-atoms/core)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Overview

`@svelte-atoms/core` is a headless-first Svelte 5 component library. Components are split into small, composable Atom Components that create runtime **Atoms** and share state through a typed **Bond**. Bonds own shared state, context, registered Atoms, and reusable **capabilities** so compound components can coordinate without tangled prop drilling.

**Key characteristics:**

- **Headless-first** — unstyled by default; bring your own CSS or design tokens
- **Bond architecture** — shared component state and typed mutation methods (`open()`, `close()`, `toggle()`, `select()`) live on a Bond
- **Atom runtime** — rendered parts own their element refs, spreads, and local capabilities
- **Accessible** — ARIA attributes, keyboard navigation, and focus management built in
- **Svelte 5 native** — uses runes, snippets, and `$bindable` throughout
- **TypeScript** — full type coverage with exported utility types

## Installation

```bash
npm install @svelte-atoms/core
# or
bun add @svelte-atoms/core
```

## Quick Start

```svelte
<script lang="ts">
	import { Button, Dialog } from '@svelte-atoms/core';

	let open = $state(false);
</script>

<Button onclick={() => (open = true)}>Open dialog</Button>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Confirm action</Dialog.Title>
		</Dialog.Header>
		<Dialog.Body>
			<p>Are you sure you want to continue?</p>
		</Dialog.Body>
		<Dialog.Footer>
			<Button onclick={() => (open = false)}>Cancel</Button>
			<Button onclick={() => (open = false)}>Confirm</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
```

## Core Concepts

### Bond architecture

Every multi-part component has a Bond that owns shared state and coordinates registered Atoms. Parts share the same Bond via Svelte context, so they can coordinate without props:

```svelte
<Collapsible.Root>
	<Collapsible.Trigger>Toggle</Collapsible.Trigger>
	<Collapsible.Content>Hidden content that the trigger controls.</Collapsible.Content>
</Collapsible.Root>
```

Parts can also access the Bond directly through a snippet prop:

```svelte
<Dialog.Root>
	{#snippet children({ bond })}
		<Dialog.Content>
			<Dialog.Body>
				<p>Access the bond to call methods directly.</p>
				<button onclick={() => bond.close()}>Close</button>
			</Dialog.Body>
		</Dialog.Content>
	{/snippet}
</Dialog.Root>
```

### Composing parts with `base`

Any part can render as a different base component using the `base` prop, enabling composition without wrapper elements:

```svelte
<script lang="ts">
	import { Button, Popover } from '@svelte-atoms/core';
</script>

<Popover.Root>
	<Popover.Trigger base={Button} preset="outline">Settings</Popover.Trigger>
	<Popover.Content>
		<p>Configure your preferences here.</p>
	</Popover.Content>
</Popover.Root>
```

### Variants

Define reusable variant maps with `defineVariants`:

```typescript
import { defineVariants } from '@svelte-atoms/core/utils';

const buttonVariants = defineVariants({
	class: 'inline-flex items-center justify-center rounded-md font-medium',
	variants: {
		variant: {
			primary: 'bg-blue-500 text-white hover:bg-blue-600',
			ghost: 'bg-transparent hover:bg-gray-100'
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
});
```

## Components

| Category   | Components                                                               |
| ---------- | ------------------------------------------------------------------------ |
| Layout     | Container, Stack, Layer, Portal, Scrollable                              |
| Forms      | Input, Textarea, Checkbox, Radio, Switch, Slider, Select, Combobox, Form |
| Overlays   | Dialog, Drawer, Popover, Tooltip, Toast, Context Menu                    |
| Navigation | Tabs, Sidebar, Menu, Dropdown, Breadcrumb, Tree                          |
| Display    | Card, Alert, Badge, Chip, Avatar, List, Datagrid, Calendar, Progress     |
| Utilities  | Button, Link, Icon, Kbd, Label, Divider, Root, Lazy                      |

[Browse all components in Storybook](https://statuesque-boba-0fb888.netlify.app/)

## Documentation

- [Full documentation](https://sacore.netlify.app/) — guides, API references, and examples
- [Storybook](https://statuesque-boba-0fb888.netlify.app/) — interactive component playground
- [GitHub](https://github.com/svelte-atoms/core) — source code and issues

## Development

```bash
git clone https://github.com/svelte-atoms/core.git
cd core
bun install

# Start Storybook dev server
bun run storybook:dev

# Build library
bun run build

# Type check
bun run check
```

## License

MIT © [Svelte Atoms](https://github.com/svelte-atoms)
