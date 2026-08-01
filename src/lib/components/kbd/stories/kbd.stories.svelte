<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Kbd, Shortcut } from '..';

	const { Story } = defineMeta({
		title: 'Atoms/Kbd',
		parameters: { layout: 'centered' },
		args: {
			key: 'Enter',
			separator: '+'
		},
		argTypes: {
			key: {
				control: 'select',
				options: [
					'Enter',
					'Esc',
					'Tab',
					'Shift',
					'Ctrl',
					'Alt',
					'⌘',
					'↑',
					'↓',
					'←',
					'→',
					'Backspace',
					'Delete',
					'Space'
				],
				description: 'The key label to display inside the Kbd element'
			},
			separator: {
				control: 'text',
				description: 'Separator rendered between keys in a Shortcut (default "+")'
			}
		}
	});
</script>

<Story name="Basic">
	{#snippet template(args)}
		<div class="flex items-center gap-4">
			<Kbd>{args.key}</Kbd>
			<Shortcut keys={['Ctrl', args.key]} separator={args.separator} />
		</div>
	{/snippet}
</Story>

<Story name="Single Key">
	{#snippet template()}
		<div class="flex items-center gap-2">
			<Kbd>⌘</Kbd>
			<Kbd>Ctrl</Kbd>
			<Kbd>Shift</Kbd>
			<Kbd>Alt</Kbd>
			<Kbd>Enter</Kbd>
			<Kbd>Esc</Kbd>
			<Kbd>Tab</Kbd>
			<Kbd>↑</Kbd>
			<Kbd>↓</Kbd>
		</div>
	{/snippet}
</Story>

<Story name="Shortcut — keys prop">
	{#snippet template()}
		<div class="flex flex-col gap-3">
			<div class="flex items-center justify-between gap-8">
				<span class="text-sm">Command Palette</span>
				<Shortcut keys={['⌘', 'K']} />
			</div>
			<div class="flex items-center justify-between gap-8">
				<span class="text-sm">Save</span>
				<Shortcut keys={['Ctrl', 'S']} />
			</div>
			<div class="flex items-center justify-between gap-8">
				<span class="text-sm">Find & Replace</span>
				<Shortcut keys={['Ctrl', 'Shift', 'H']} />
			</div>
			<div class="flex items-center justify-between gap-8">
				<span class="text-sm">Close Tab</span>
				<Shortcut keys={['Ctrl', 'W']} />
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Custom Separator">
	{#snippet template()}
		<div class="flex flex-col gap-2">
			<Shortcut keys={['Ctrl', 'Alt', 'Del']} separator="+" />
			<Shortcut keys={['Fn', 'F5']} separator="+" />
			<Shortcut keys={['Alt', 'Tab']} separator="→" />
		</div>
	{/snippet}
</Story>

<Story name="Manual Composition">
	{#snippet template()}
		<Shortcut>
			<Kbd>⌘</Kbd>
			<span class="text-muted-foreground text-xs">then</span>
			<Kbd>K</Kbd>
		</Shortcut>
	{/snippet}
</Story>

<Story name="Inline Usage">
	{#snippet template()}
		<p class="text-sm leading-relaxed">
			Press <Kbd>⌘</Kbd>
			<Kbd>K</Kbd> to open the command palette, or use
			<Shortcut keys={['Ctrl', 'Shift', 'P']} /> to access all commands.
		</p>
	{/snippet}
</Story>
