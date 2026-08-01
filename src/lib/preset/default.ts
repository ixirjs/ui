import type { ClassValue } from 'svelte/elements';
import { definePreset } from '$ixirjs/ui/context/preset.svelte';
import type { Preset, PresetEntry, PresetEntryRecord } from './types';
import { BUILT_IN_PRESET_KEYS, type BuiltInPresetName } from './manifest';

/** Reusable presentation chunks for the shipped starter theme. */
const layout = {
	stack: 'flex flex-col',
	inline: 'inline-flex items-center',
	cluster: 'flex items-center gap-2',
	content: 'px-4 py-3',
	section: 'space-y-2'
} as const;

const surface = {
	card: 'rounded-md border border-border bg-card text-card-foreground',
	popover: 'rounded-md border border-border bg-popover text-popover-foreground shadow-md',
	muted: 'rounded-md border border-border bg-muted text-muted-foreground',
	floating: 'rounded-md border border-border bg-popover text-popover-foreground shadow-lg'
} as const;

const text = {
	title: 'font-semibold leading-none tracking-tight',
	description: 'text-sm text-muted-foreground',
	label: 'text-sm font-medium leading-none',
	meta: 'text-xs text-muted-foreground'
} as const;

const interaction = {
	focus:
		'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
	control: 'disabled:pointer-events-none disabled:opacity-50',
	hover: 'transition-colors hover:bg-accent hover:text-accent-foreground'
} as const;

function entry(...classes: readonly ClassValue[]): PresetEntry {
	const record = Object.freeze({ class: Object.freeze(classes) });
	return () => record;
}

function variantEntry(
	classes: readonly ClassValue[],
	variants: PresetEntryRecord['variants'],
	defaults?: PresetEntryRecord['defaults']
): PresetEntry {
	const record = Object.freeze({
		class: Object.freeze(classes),
		...(variants ? { variants } : {}),
		...(defaults ? { defaults } : {})
	});
	return () => record;
}

const buttonVariants = {
	variant: {
		primary: { class: 'bg-primary text-primary-foreground hover:bg-primary/90' },
		secondary: { class: 'bg-secondary text-secondary-foreground hover:bg-secondary/80' },
		destructive: { class: 'bg-destructive text-destructive-foreground hover:bg-destructive/90' },
		outline: {
			class: 'border border-border bg-background hover:bg-accent hover:text-accent-foreground'
		},
		ghost: { class: 'hover:bg-accent hover:text-accent-foreground' }
	}
} as const;

const alertVariants = {
	variant: {
		primary: { class: 'border-primary/30 bg-primary/10 text-primary' },
		secondary: { class: 'border-secondary bg-secondary text-secondary-foreground' },
		destructive: { class: 'border-destructive/30 bg-destructive/10 text-destructive' },
		outline: { class: 'border-border bg-background text-foreground' },
		ghost: { class: 'border-transparent bg-transparent text-foreground' },
		warning: { class: 'border-chart-4/30 bg-chart-4/10 text-foreground' },
		info: { class: 'border-chart-2/30 bg-chart-2/10 text-foreground' },
		success: { class: 'border-chart-3/30 bg-chart-3/10 text-foreground' },
		error: { class: 'border-destructive/30 bg-destructive/10 text-destructive' }
	}
} as const;

const toastVariants = {
	variant: {
		default: { class: 'border-border bg-card text-card-foreground' },
		info: { class: 'border-chart-2/30 bg-chart-2/10 text-foreground' },
		success: { class: 'border-chart-3/30 bg-chart-3/10 text-foreground' },
		warning: { class: 'border-chart-4/30 bg-chart-4/10 text-foreground' },
		error: { class: 'border-destructive/30 bg-destructive/10 text-destructive' }
	}
} as const;

const emptyEntry = entry();

// Entries with deliberate visual policy. Every other shipped slot receives the stable empty entry
// below, so an application can reliably override any manifest key without a missing-preset branch.
const styledEntries = {
	root: entry(layout.stack, 'min-h-screen bg-background text-foreground'),
	accordion: entry(layout.stack, 'w-full divide-y divide-border', surface.card),
	'accordion.item': entry('py-1'),
	'accordion.item.header': entry(
		layout.cluster,
		interaction.hover,
		interaction.focus,
		'w-full rounded px-3 py-2 text-left'
	),
	'accordion.item.body': entry('px-3 pb-3 text-sm'),
	alert: variantEntry([layout.stack, 'gap-1 rounded-md border p-4'], alertVariants, {
		variant: 'primary'
	}),
	'alert.actions': entry(layout.cluster, 'mt-2'),
	'alert.content': entry(layout.stack, 'gap-1'),
	'alert.title': entry(text.title),
	'alert.description': entry(text.description),
	badge: variantEntry(
		['inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium'],
		buttonVariants,
		{ variant: 'primary' }
	),
	button: variantEntry(
		[
			'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium',
			interaction.focus,
			interaction.control
		],
		buttonVariants,
		{ variant: 'primary' }
	),
	card: entry(layout.stack, surface.card, 'gap-4 p-4 shadow-sm'),
	'card.header': entry(layout.stack, 'gap-1'),
	'card.title': entry(text.title),
	'card.subtitle': entry(text.description),
	'card.description': entry(text.description),
	'card.content': entry(layout.stack, layout.section),
	'card.footer': entry(layout.cluster, 'justify-end'),
	checkbox: entry(interaction.focus, interaction.control, 'size-4 rounded border border-input'),
	chip: entry(
		layout.inline,
		interaction.control,
		'gap-1 rounded-full border border-border bg-secondary px-2 py-1 text-sm'
	),
	'chip.close': entry(interaction.focus, 'rounded-full p-0.5 hover:bg-accent'),
	collapsible: entry(layout.stack, surface.card, 'overflow-hidden'),
	'collapsible.header': entry(
		layout.cluster,
		interaction.hover,
		interaction.focus,
		'cursor-pointer justify-between px-3 py-2'
	),
	'collapsible.body': entry('px-3 pb-3 text-sm'),
	'combobox.trigger': entry(
		layout.cluster,
		interaction.focus,
		interaction.control,
		'w-full justify-between rounded-md border border-input bg-background px-3 py-2'
	),
	'combobox.content': entry(surface.floating, 'p-1'),
	'combobox.item': entry(interaction.hover, 'cursor-default rounded-sm px-2 py-1.5 text-sm'),
	container: entry('mx-auto w-full max-w-7xl px-4'),
	'context-menu.content': entry(surface.floating, 'min-w-40 p-1'),
	'context-menu.item': entry(interaction.hover, 'cursor-default rounded-sm px-2 py-1.5 text-sm'),
	datagrid: entry(surface.card, 'overflow-hidden'),
	'datagrid.header': entry('border-b border-border bg-muted/50'),
	'datagrid.row': entry('border-b border-border last:border-0'),
	'datagrid.column': entry('px-4 py-3 text-left text-sm font-medium'),
	'datagrid.cell': entry('px-4 py-3 text-sm'),
	dialog: entry('fixed inset-0 flex items-center justify-center p-4'),
	'dialog.content': entry(surface.floating, 'w-full max-w-lg'),
	'dialog.header': entry('border-b border-border px-6 py-4'),
	'dialog.body': entry('px-6 py-4'),
	'dialog.footer': entry(layout.cluster, 'justify-end border-t border-border px-6 py-4'),
	'dialog.title': entry(text.title),
	'dialog.description': entry(text.description),
	drawer: entry(surface.floating, 'h-full w-full max-w-md'),
	'drawer.header': entry('border-b border-border px-6 py-4'),
	'drawer.body': entry('px-6 py-4'),
	'drawer.footer': entry(layout.cluster, 'justify-end border-t border-border px-6 py-4'),
	'drawer.title': entry(text.title),
	'drawer.description': entry(text.description),
	field: entry(layout.stack, 'gap-2'),
	'field.label': entry(text.label),
	'field.helper-text': entry(text.meta),
	input: entry(layout.stack, 'gap-1'),
	'input.control': entry(
		interaction.focus,
		interaction.control,
		'w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
	),
	label: entry(text.label),
	'list.root': entry(layout.stack, surface.card, 'divide-y divide-border'),
	'list.item': entry('px-4 py-3'),
	'list.title': entry(text.title),
	'popover.content': entry(surface.floating, 'p-4'),
	'popover-dialog': entry(surface.floating, 'w-full max-w-lg'),
	'popover-dialog.header': entry('border-b border-border px-6 py-4'),
	'popover-dialog.body': entry('px-6 py-4'),
	'popover-dialog.footer': entry(layout.cluster, 'justify-end border-t border-border px-6 py-4'),
	'popover-dialog.title': entry(text.title),
	'popover-dialog.description': entry(text.description),
	radio: entry(interaction.focus, interaction.control, 'size-4 rounded-full border border-input'),
	'select.trigger': entry(
		layout.cluster,
		interaction.focus,
		interaction.control,
		'w-full justify-between rounded-md border border-input bg-background px-3 py-2'
	),
	'select.content': entry(surface.floating, 'p-1'),
	'select.item': entry(interaction.hover, 'cursor-default rounded-sm px-2 py-1.5 text-sm'),
	'select.placeholder': entry('text-muted-foreground'),
	sidebar: entry(surface.card, 'h-full w-64 p-3'),
	slider: entry('relative flex w-full touch-none select-none items-center'),
	'slider.track': entry('relative h-1.5 w-full grow overflow-hidden rounded-full bg-secondary'),
	'slider.fill': entry('absolute h-full bg-primary'),
	'slider.thumb': entry(
		interaction.focus,
		'block size-4 rounded-full border-2 border-primary bg-background'
	),
	'stack.root': entry(layout.stack),
	'stepper.step': entry(layout.stack, surface.card, 'gap-2 p-4'),
	switch: entry(
		interaction.focus,
		interaction.control,
		'inline-flex h-6 w-11 rounded-full bg-input'
	),
	'switch.thumb': entry('size-5 rounded-full bg-background shadow-sm'),
	tab: entry(layout.stack, 'gap-2'),
	'tab.header': entry(
		interaction.hover,
		interaction.focus,
		'border-b-2 border-transparent px-3 py-2 text-sm font-medium data-[active=true]:border-primary data-[active=true]:text-primary'
	),
	'tab.description': entry(text.description),
	tabs: entry(layout.stack, 'gap-3'),
	'tabs.header': entry('flex border-b border-border'),
	'tabs.content': entry('py-2'),
	textarea: entry(
		interaction.focus,
		interaction.control,
		'w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
	),
	toast: variantEntry(
		['relative flex w-80 flex-col gap-1 rounded-md border p-4 pr-8 shadow-md'],
		toastVariants,
		{ variant: 'default' }
	),
	'toast.title': entry(text.title),
	'toast.description': entry(text.description),
	'toast.close': entry(interaction.focus, 'absolute right-2 top-2 rounded p-1 hover:bg-accent'),
	'tooltip.content': entry(surface.floating, 'px-3 py-1.5 text-sm'),
	tree: entry(layout.stack, surface.card),
	'tree.header': entry(
		interaction.hover,
		interaction.focus,
		'flex cursor-pointer items-center gap-2 px-3 py-2'
	),
	'tree.body': entry('pl-4'),
	'tree.indicator': entry('text-muted-foreground')
} satisfies Partial<Record<BuiltInPresetName, PresetEntry>>;

function entryFor(key: BuiltInPresetName): PresetEntry {
	return (styledEntries as Partial<Record<BuiltInPresetName, PresetEntry>>)[key] ?? emptyEntry;
}

/**
 * Optional, complete starter presentation for every shipped preset slot.
 * Install it with `setPreset(defaultPreset)` during component initialization.
 */
export const defaultPreset = definePreset(
	Object.fromEntries(BUILT_IN_PRESET_KEYS.map((key) => [key, entryFor(key)])) as Preset
);
