# @ixirjs/ui

Accessible Svelte 5 infrastructure for reusable component systems.

[![npm version](https://img.shields.io/npm/v/@ixirjs/ui.svg)](https://www.npmjs.com/package/@ixirjs/ui)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/ixirjs/ui)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## What It Provides

- Accessible component behavior for overlays, forms, navigation, display, and layout.
- Compound components coordinated by Bonds instead of prop drilling.
- Runtime Atoms for per-part attrs, handlers, lifecycle, and relationship wiring.
- Presets, variants, and `base` composition for design-system integration.
- Svelte 5 runes, snippets, `$bindable`, and TypeScript.

## Example

```svelte
<script lang="ts">
	import { Button, Popover } from '@ixirjs/ui';
</script>

<Popover.Root>
	<Popover.Trigger base={Button} preset="button" variant="outline">Settings</Popover.Trigger>
	<Popover.Content class="p-4">Account preferences</Popover.Content>
</Popover.Root>
```

## Prerequisites

- Svelte `^5.46.4`
- Tailwind CSS v4 for the documented CSS-first styling setup
- Node.js 18+

## Install

```bash
npm install @ixirjs/ui
# or
bun add @ixirjs/ui
```

For Tailwind v4, scan the package classes from your application stylesheet:

```css
@import 'tailwindcss';
@source './../node_modules/@ixirjs/ui/**/*.{js,ts,svelte}';
```

## Links

- [Documentation](https://sacore.netlify.app/)
- [Storybook](https://statuesque-boba-0fb888.netlify.app/)
- [GitHub](https://github.com/ixirjs/ui)

## Development

```bash
bun install
bun run storybook:dev
bun run build
bun run check
```

MIT © [Svelte Atoms](https://github.com/ixirjs)
