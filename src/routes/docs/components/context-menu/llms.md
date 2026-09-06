# ContextMenu

A right-click menu using the canonical `context-menu` profile: shared disclosure, positioning,
navigation and typeahead, plus a virtual pointer anchor. It reuses DropdownMenu and Popover parts,
not a family subclass or constructor factory.

## Root and state

`ContextMenu.Root` creates and disposes its state. Its children snippet receives `{ popover }`,
typed as the `ContextMenuBond` interface. Bind `open` or call the supplied Bond's commands.
Family constructor values and root/item `factory` props are removed.

Supported root props include `open`, `disabled`, `placement`, `placements`, `offset`, `position`,
`portal`, `presets`, `children` and `onopenchange`. ContextMenu does not provide Select's
`value`, `values`, `multiple` or query APIs.

{{contextMenuRootProps}}

## Parts

- `ContextMenu.Trigger`: intercepts `contextmenu`, builds a virtual pointer anchor and opens the
  menu. Left-click does not open it. Call `event.preventDefault()` in `oncontextmenu` to cancel;
  returning `false` is not a cancellation API.
- `ContextMenu.Content`: the floating menu surface, sized independently of the trigger by default.
- `ContextMenu.Item`: a shared collection-item handle; selection of an action closes the menu.
- `Tail`, `Indicator`, `Divider`, `Group`, `Title`: reused presentation parts.

There are no `ContextMenu.List` or `ContextMenu.Arrow` aliases. Use `Content` and `Tail`.
Preset keys include `context-menu.trigger`, `context-menu.content` and `context-menu.item`.

{{contextMenuTriggerProps}}

{{contextMenuContentProps}}

{{contextMenuItemProps}}

## Example

```svelte
<script lang="ts">
	import { ContextMenu } from '@ixirjs/ui/components/context-menu';
	let action = $state('—');
</script>

<ContextMenu.Root>
	{#snippet children({ popover })}
		<!-- The root supplies its interface; there is no constructor injection. -->
		<ContextMenu.Trigger>Right-click for actions</ContextMenu.Trigger>
		<ContextMenu.Content>
			<ContextMenu.Item onclick={() => (action = 'Copy')}>Copy</ContextMenu.Item>
			<ContextMenu.Item onclick={() => (action = 'Paste')}>Paste</ContextMenu.Item>
		</ContextMenu.Content>
		<code>open: {String(popover.isOpen)} · action: {action}</code>
	{/snippet}
</ContextMenu.Root>
```

Configure presentation through props and presets from `@ixirjs/ui/preset`. Use the canonical
`PopupBond` and profile-discovery helpers from `@ixirjs/ui/experimental` only for expert state
composition; `ContextMenuBond` itself is a type-only import.

## Interaction and accessibility

The menu supports arrow/Home/End navigation, buffered typeahead, Escape dismissal and focus
management through the shared overlay infrastructure. Its anchor uses the pointer coordinates,
not the trigger element's rectangle. Provide visible alternative actions when a context menu is
not discoverable or convenient for the user's input device.

Related: [DropdownMenu](/docs/components/dropdown-menu), [Popover](/docs/components/popover).
