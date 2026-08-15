<script lang="ts">
	// The overlay/menu families, which neither `family-ssr-probe` nor `control-ssr-probe` covers.
	//
	// A separate file rather than more `{:else if}` branches on either of those: both carry the same
	// comment recording that inserting a branch shifts every later family's `$props.id()` seed and
	// rewrites snapshots that did not change. Appending here costs nothing and moves nothing.
	//
	// These are the families whose items go through a WRAPPER component — `Select.Item` and
	// `DropdownMenu.Item` each mount `List.Item` and forward with `{...spread}`, and `Combobox.Item`
	// stacks a third boundary on top. Collapsing those wrappers must not change a byte, and none of
	// these families had a byte-level check anywhere, which is exactly what makes such a change
	// unverifiable — "no visible change" is not the same as "no change".
	//
	// **Items sit directly under the root, not inside `Content`.** `Content` portals, and a portal
	// renders nothing on the server — the first version of this probe put items where a consumer
	// writes them and snapshotted five triggers and zero items, gating exactly none of the code it
	// exists to protect. The items only need the root's bond context, which they get either way, and
	// their presentation depends on the atom, the preset key and the bond's per-slot layer — none of
	// which know whether a portal is between them and the root.
	//
	// `Content` is still rendered so the composition stays realistic and the trigger/root wiring is
	// gated too; it simply contributes no bytes here.
	import { Select } from '$ixirjs/ui/components/select';
	import { Combobox } from '$ixirjs/ui/components/combobox';
	import { DropdownMenu } from '$ixirjs/ui/components/dropdown-menu';
	import { ContextMenu } from '$ixirjs/ui/components/context-menu';
	import { Tooltip } from '$ixirjs/ui/components/tooltip';

	export type Menu =
		| 'select'
		| 'combobox'
		| 'dropdown-menu'
		| 'context-menu'
		| 'tooltip'
		// Edge arms, appended rather than inserted. Each exercises a way the item props can reach the
		// element that the plain arms do not: `class` as an ARRAY (which the wrappers currently
		// stringify with `.join(' ')`, so `['a','b']` renders as `a,b`), an overridden `as`, a bare
		// DOM attribute, an explicit `preset`, and a consumer `onclick` that must still compose.
		| 'select-edge'
		| 'dropdown-menu-edge';

	let { menu }: { menu: Menu } = $props();
</script>

{#if menu === 'select'}
	<Select.Root open value="b">
		<Select.Trigger>Pick one</Select.Trigger>
		<Select.Content />
		<Select.Item value="a">Alpha</Select.Item>
		<Select.Item value="b">Beta</Select.Item>
		<Select.Item value="c" class="custom-item">Gamma</Select.Item>
	</Select.Root>
{:else if menu === 'combobox'}
	<Combobox.Root open>
		<Combobox.Trigger>Search</Combobox.Trigger>
		<Combobox.Content />
		<Combobox.Item value="a">Alpha</Combobox.Item>
		<Combobox.Item value="b" class="custom-item">Beta</Combobox.Item>
	</Combobox.Root>
{:else if menu === 'dropdown-menu'}
	<DropdownMenu.Root open>
		<DropdownMenu.Trigger>Options</DropdownMenu.Trigger>
		<DropdownMenu.Content />
		<DropdownMenu.Item>Edit</DropdownMenu.Item>
		<DropdownMenu.Item class="custom-item">Duplicate</DropdownMenu.Item>
		<DropdownMenu.Divider />
		<DropdownMenu.Item disabled>Delete</DropdownMenu.Item>
	</DropdownMenu.Root>
{:else if menu === 'context-menu'}
	<ContextMenu.Root open>
		<ContextMenu.Trigger>Right click</ContextMenu.Trigger>
		<ContextMenu.Content />
		<ContextMenu.Item>Cut</ContextMenu.Item>
		<ContextMenu.Item class="custom-item">Copy</ContextMenu.Item>
	</ContextMenu.Root>
{:else if menu === 'tooltip'}
	<Tooltip.Root open>
		<Tooltip.Trigger>Hover</Tooltip.Trigger>
		<Tooltip.Content>Explanatory text</Tooltip.Content>
	</Tooltip.Root>
{:else if menu === 'select-edge'}
	<Select.Root open>
		<Select.Item value="a" class={['array-one', 'array-two']}>Array class</Select.Item>
		<Select.Item value="b" as="div" data-probe="1">Overridden tag</Select.Item>
		<Select.Item value="c" preset="button" onclick={() => {}}>Explicit preset</Select.Item>
	</Select.Root>
{:else}
	<DropdownMenu.Root open>
		<DropdownMenu.Item class={['array-one', 'array-two']}>Array class</DropdownMenu.Item>
		<DropdownMenu.Item as="div" data-probe="1">Overridden tag</DropdownMenu.Item>
		<DropdownMenu.Item preset="button" onclick={() => {}}>Explicit preset</DropdownMenu.Item>
	</DropdownMenu.Root>
{/if}
