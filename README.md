# @svelte-atoms/core

> A modern, headless, and accessible Svelte 5 UI component library built for composability and extensibility.

[![npm version](https://img.shields.io/npm/v/@svelte-atoms/core.svg)](https://www.npmjs.com/package/@svelte-atoms/core)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/svelte-atoms/core)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Why Svelte Atoms?

- **🎯 Headless First** - Complete styling control with sensible defaults
- **🔗 Bond Architecture** - Self-contained state management with context-based communication
- **♿ Accessible** - ARIA attributes, keyboard navigation, and focus management included
- **🎨 Composable** - Build complex UIs by combining simple, reusable components
- **📘 Type Safe** - Full TypeScript support with extensible type definitions
- **⚡ Svelte 5 Native** - Built for Svelte 5 runes, snippets, and modern reactivity

## Quick Start

```bash
npm install @svelte-atoms/core
```

```svelte
<script lang="ts">
	import { Button, Dialog } from '@svelte-atoms/core';

	let open = $state(false);
</script>

<Button onclick={() => (open = true)}>Open Dialog</Button>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Welcome</Dialog.Title>
		</Dialog.Header>
		<Dialog.Body>
			<p>This is a headless, accessible dialog component.</p>
		</Dialog.Body>
		<Dialog.Footer>
			<Button onclick={() => (open = false)}>Close</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
```

## Core Concepts

### Composability with `base` and `as`

Transform any component into another element or wrap it with custom logic:

```svelte
<script lang="ts">
	import { Button, Popover, Input } from '@svelte-atoms/core';
</script>

<!-- Button as Popover trigger -->
<Popover.Root>
	<Popover.Trigger base={Button} variant="outline">
		Open Popover
	</Popover.Trigger>
	<Popover.Content>
		<p>Configure your preferences here.</p>
	</Popover.Content>
</Popover.Root>

<!-- Input as Dropdown trigger -->
<Dropdown.Root>
	<Dropdown.Trigger base={Input.Root}>
		<Input.Control placeholder="Search..." />
	</Dropdown.Trigger>
	<Dropdown.Content>
		<!-- items -->
	</Dropdown.Content>
</Dropdown.Root>
```

### Typed Snippets for Extensibility

All components expose typed snippet props for maximum flexibility:

```svelte
<Dialog.Root>
	{#snippet children({ dialog })}
		<Dialog.Content>
			<Dialog.Body>
				<p>Access the dialog bond directly</p>
				<button onclick={() => dialog.close()}>Close via bond</button>
			</Dialog.Body>
		</Dialog.Content>
	{/snippet}
</Dialog.Root>
```

### Styling with Variants

Create reusable variants locally or globally:

```typescript
import { defineVariants } from '@svelte-atoms/core/utils';

const buttonVariants = defineVariants({
	class: 'inline-flex items-center justify-center rounded-md',
	variants: {
		variant: {
			primary: 'bg-blue-500 text-white hover:bg-blue-600',
			secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300'
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

**Layout:** Container, Stack, Layer, Portal  
**Forms:** Input, Textarea, Checkbox, Radio, Select, Combobox, Form  
**Overlays:** Dialog, Drawer, Popover, Tooltip, Toast  
**Navigation:** Tabs, Sidebar, Menu, Dropdown  
**Display:** Card, Alert, Badge, Chip, List, Datagrid, Calendar  
**Utilities:** Root, Lazy, Link, Button

[View all components in Storybook →](https://statuesque-boba-0fb888.netlify.app/)

## Documentation

- **[Full Documentation](https://sacore.netlify.app/)** - Guides, API references, and examples
- **[Storybook](https://statuesque-boba-0fb888.netlify.app/)** - Interactive component playground
- **[GitHub](https://github.com/svelte-atoms/core)** - Source code and issues

## Development

```bash
# Clone and install
git clone https://github.com/svelte-atoms/core.git
cd core
bun install

# Start dev server
bun dev

# Build library
bun run build
```

## License

MIT © [Svelte Atoms Team](https://github.com/svelte-atoms)

