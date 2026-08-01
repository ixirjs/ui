# ContextMenu Module

The ContextMenu module provides a context menu implementation triggered by right-click interactions. It extends the Dropdown component with special trigger behavior that opens the menu at the cursor position.

## Features

- **Right-Click Activation**: Opens menu on right-click (contextmenu event)
- **Cursor Positioning**: Menu appears at the exact cursor location
- **Virtual Trigger**: Uses a virtual element for positioning at cursor coordinates
- **Dropdown Integration**: Reuses dropdown components for content, items, and styling
- **Customizable**: Supports custom behavior through props and event handlers

## Components

### ContextMenu.Root

Root container for the context menu system. Extends Dropdown.Root with positioning logic.

ContextMenu.Root is inherited from `Dropdown.Root`.

Notable inherited props include `open`, `value`, `values`, `multiple`, `disabled`, `placements`, `placement`, `offset`, `keys`, `factory`, and `onquerychange`.

**Props:**

{{contextMenuRootProps}}

### ContextMenu.Trigger

Element that triggers the context menu on right-click. Prevents the default browser context menu and opens the custom menu at cursor position.

**Preset Key:** `context-menu.trigger`

**Key Behavior:**

- Intercepts `oncontextmenu` event (right-click)
- Prevents default browser context menu
- Creates a virtual element at cursor position for menu positioning
- Opens the context menu at that position

**Props:**

{{contextMenuTriggerProps}}

### ContextMenu.Content / ContextMenu.List

The context menu content container. Same as Dropdown.Content.

Default preset: `menu.content`

Use `preset="context-menu.content"` if you want a context-menu-specific preset namespace.

**Props:**

{{contextMenuContentProps}}

### ContextMenu.Item

Individual menu item component. Same as Dropdown.Item.

Default preset: `dropdown.item`

Use `preset="context-menu.item"` if you want a context-menu-specific preset namespace.

**Props:**

{{contextMenuItemProps}}

### Other Components

The following components are inherited from Dropdown, Popover, and List modules:

- **ContextMenu.Arrow** - Arrow pointer for the menu (from Popover)
- **ContextMenu.Indicator** - State indicator (from Popover)
- **ContextMenu.Divider** - Visual separator between items (from List)
- **ContextMenu.Group** - Logical grouping of items (from List)
- **ContextMenu.Title** - Group title element (from List)

## Usage

### Basic Context Menu

```svelte
<script>
	import { ContextMenu } from '@svelte-atoms/core/context-menu';
</script>

<ContextMenu.Root>
	<ContextMenu.Trigger>Right-click me</ContextMenu.Trigger>
	<ContextMenu.List>
		<ContextMenu.Item onclick={() => console.log('Copy')}>Copy</ContextMenu.Item>
		<ContextMenu.Item onclick={() => console.log('Paste')}>Paste</ContextMenu.Item>
		<ContextMenu.Divider />
		<ContextMenu.Item onclick={() => console.log('Delete')}>Delete</ContextMenu.Item>
	</ContextMenu.List>
</ContextMenu.Root>
```

### With Groups and Titles

```svelte
<ContextMenu.Root>
	<ContextMenu.Trigger>Right-click for options</ContextMenu.Trigger>
	<ContextMenu.List>
		<ContextMenu.Group>
			<ContextMenu.Title>Edit</ContextMenu.Title>
			<ContextMenu.Item>Cut</ContextMenu.Item>
			<ContextMenu.Item>Copy</ContextMenu.Item>
			<ContextMenu.Item>Paste</ContextMenu.Item>
		</ContextMenu.Group>
		<ContextMenu.Divider />
		<ContextMenu.Group>
			<ContextMenu.Title>Actions</ContextMenu.Title>
			<ContextMenu.Item>Rename</ContextMenu.Item>
			<ContextMenu.Item>Delete</ContextMenu.Item>
		</ContextMenu.Group>
	</ContextMenu.List>
</ContextMenu.Root>
```

### Controlled State

```svelte
<script>
	let open = $state(false);
</script>

<ContextMenu.Root bind:open>
	<ContextMenu.Trigger>
		Right-click me (open: {open})
	</ContextMenu.Trigger>
	<ContextMenu.List>
		<ContextMenu.Item onclick={() => (open = false)}>Close Menu</ContextMenu.Item>
	</ContextMenu.List>
</ContextMenu.Root>
```

### Custom Context Menu Handler

```svelte
<script>
	function handleContextMenu(event: MouseEvent) {
		// Custom logic before opening menu
		console.log('Context menu triggered at', event.clientX, event.clientY);
		// Return false or call event.preventDefault() to prevent menu from opening
	}
</script>

<ContextMenu.Root>
	<ContextMenu.Trigger oncontextmenu={handleContextMenu}>
		Right-click with custom handler
	</ContextMenu.Trigger>
	<ContextMenu.List>
		<ContextMenu.Item>Action 1</ContextMenu.Item>
		<ContextMenu.Item>Action 2</ContextMenu.Item>
	</ContextMenu.List>
</ContextMenu.Root>
```

## Implementation Details

### Virtual Element Positioning

When the context menu is triggered, the `ContextMenu.Trigger` component:

1. Intercepts the `contextmenu` event (right-click)
2. Calls the custom `oncontextmenu` handler if provided
3. If not prevented, creates a virtual element:
   ```typescript
   const virtualElement = {
   	getBoundingClientRect: () => ({
   		width: 0,
   		height: 0,
   		x: event.clientX,
   		y: event.clientY,
   		top: event.clientY,
   		left: event.clientX,
   		right: event.clientX,
   		bottom: event.clientY
   	})
   };
   ```
4. Sets this virtual element as the menu's trigger reference
5. Opens the menu, which positions itself relative to this virtual element

This approach allows the menu to appear exactly where the user right-clicked, rather than being anchored to a physical DOM element.

## Accessibility

The ContextMenu component inherits accessibility features from Dropdown and Popover:

- Keyboard navigation within menu items
- Focus management when opening/closing
- ARIA attributes for screen readers
- Escape key to close menu

Note: Context menus should be used sparingly as they may not be discoverable by all users. Consider providing alternative access methods (e.g., toolbar buttons) for critical functionality.

## Preset Configuration

Customize the context menu appearance using presets:

```typescript
import { createPreset } from '@svelte-atoms/core';

const preset = createPreset({
	'context-menu.trigger': () => ({
		class: 'cursor-context-menu select-none'
	}),
	'context-menu.content': () => ({
		class: 'min-w-[8rem] rounded-md border bg-popover p-1 shadow-md flex flex-col gap-0.5'
	}),
	'context-menu.item': () => ({
		class:
			'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground'
	})
});
```

## Related Components

- **Dropdown** - The underlying dropdown implementation
- **Popover** - Provides positioning and overlay behavior
- **List** - Provides Divider, Group, and Title components
