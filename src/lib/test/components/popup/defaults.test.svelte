<script module lang="ts">
	export const captured = new Map<string, unknown>();
	function capture(family: string, bond: unknown) {
		captured.set(family, bond);
		return '';
	}
</script>

<script lang="ts">
	import { PopoverRoot } from '@ixirjs/ui/components/popover';
	import { DropdownMenuRoot } from '@ixirjs/ui/components/dropdown-menu';
	import { SelectRoot } from '@ixirjs/ui/components/select';
	import { ComboboxRoot } from '@ixirjs/ui/components/combobox';
	import { TooltipRoot } from '@ixirjs/ui/components/tooltip';
	import { ContextMenuRoot } from '@ixirjs/ui/components/context-menu';
	import { DatePickerRoot } from '@ixirjs/ui/components/date-picker';
	import { PopoverDialogRoot } from '@ixirjs/ui/components/popover-dialog';
	import { DropdownMenuItem } from '@ixirjs/ui/components/dropdown-menu';
	import { SelectItem } from '@ixirjs/ui/components/select';
</script>

<PopoverRoot>
	{#snippet children({ popover })}
		{capture('popover', popover)}
	{/snippet}
</PopoverRoot>
<DropdownMenuRoot>
	{#snippet children({ popover })}
		{capture('dropdown-menu', popover)}
		<DropdownMenuItem>Alpha</DropdownMenuItem>
	{/snippet}
</DropdownMenuRoot>
<SelectRoot>
	{#snippet children({ select })}
		{capture('select', select)}
		<SelectItem value="alpha">Alpha</SelectItem>
	{/snippet}
</SelectRoot>
<ComboboxRoot>
	{#snippet children({ combobox })}
		{capture('combobox', combobox)}
		<SelectItem value="alpha">Alpha</SelectItem>
	{/snippet}
</ComboboxRoot>
<TooltipRoot>
	{#snippet children({ popover })}
		{capture('tooltip', popover)}
	{/snippet}
</TooltipRoot>
<ContextMenuRoot>
	{#snippet children({ popover })}
		{capture('context-menu', popover)}
		<DropdownMenuItem>Alpha</DropdownMenuItem>
	{/snippet}
</ContextMenuRoot>
<DatePickerRoot>
	{#snippet children({ datePicker })}
		{capture('date-picker', datePicker)}
	{/snippet}
</DatePickerRoot>
<PopoverDialogRoot>
	{#snippet children({ popoverDialog })}
		{capture('popover-dialog', popoverDialog)}
	{/snippet}
</PopoverDialogRoot>
