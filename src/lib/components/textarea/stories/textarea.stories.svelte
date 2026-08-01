<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Textarea } from '..';
	import { Label } from '$ixirjs/ui/components/label';

	const { Story } = defineMeta({
		title: 'Atoms/Textarea',
		parameters: { layout: 'centered' },
		args: {
			placeholder: 'Type something…',
			disabled: false,
			readonly: false,
			rows: 4
		},
		argTypes: {
			placeholder: {
				control: 'text',
				description: 'Placeholder text shown when the field is empty'
			},
			disabled: {
				control: 'boolean',
				description: 'Disable the textarea, preventing interaction'
			},
			readonly: {
				control: 'boolean',
				description: 'Make the textarea read-only (value visible but not editable)'
			},
			rows: {
				control: 'number',
				description: 'Number of visible text lines'
			}
		}
	});
</script>

<script lang="ts">
	import { Button } from '$ixirjs/ui/components/button';

	let value = $state('');
	let charLimited = $state('');
	const maxlength = 120;

	// Real-world: a support-request composer with a live character count.
	let ticket = $state('');
	const ticketMax = 500;
</script>

<Story name="Basic">
	{#snippet template(args)}
		<div class="flex w-80 flex-col gap-1">
			<Label>Message</Label>
			<Textarea.Root class="w-80">
				<Textarea.Input
					placeholder={args.placeholder}
					disabled={args.disabled}
					readonly={args.readonly}
					rows={args.rows}
				/>
			</Textarea.Root>
		</div>
	{/snippet}
</Story>

<!--
	Controlled: bind the `value` prop to local state and read it back live.
	This is the primary API — `bind:value` keeps the textarea and your state in sync.
-->
<Story name="Controlled">
	<div class="flex w-80 flex-col gap-1">
		<Label>Bio</Label>
		<Textarea.Root class="w-80">
			<Textarea.Input bind:value placeholder="Tell us about yourself…" rows={4} />
		</Textarea.Root>
		<p class="text-muted-foreground text-xs">{value.length} characters</p>
	</div>
</Story>

<Story name="States" parameters={{ layout: 'fullscreen' }}>
	<div class="flex flex-col gap-4 p-4">
		<div class="flex flex-col gap-1">
			<Label>Default</Label>
			<Textarea.Root class="w-80">
				<Textarea.Input placeholder="Enter text…" rows={4} />
			</Textarea.Root>
		</div>

		<div class="flex flex-col gap-1">
			<Label>Disabled</Label>
			<Textarea.Root class="w-80">
				<Textarea.Input value="Prefilled value" disabled rows={4} />
			</Textarea.Root>
		</div>

		<div class="flex flex-col gap-1">
			<Label>Readonly</Label>
			<Textarea.Root class="w-80">
				<Textarea.Input value="Read-only value" readonly rows={4} />
			</Textarea.Root>
		</div>
	</div>
</Story>

<Story name="Rows" parameters={{ layout: 'fullscreen' }}>
	<div class="flex flex-col gap-4 p-4">
		<div class="flex flex-col gap-1">
			<Label>2 rows</Label>
			<Textarea.Root class="w-80">
				<Textarea.Input placeholder="Short note…" rows={2} />
			</Textarea.Root>
		</div>

		<div class="flex flex-col gap-1">
			<Label>8 rows</Label>
			<Textarea.Root class="w-80">
				<Textarea.Input placeholder="Longer message…" rows={8} />
			</Textarea.Root>
		</div>
	</div>
</Story>

<!--
	Character limit: `maxlength` caps input at the DOM level; the counter below
	reads the same bound value back to show remaining characters.
-->
<Story name="Character Limit">
	<div class="flex w-80 flex-col gap-1">
		<Label>Comment</Label>
		<Textarea.Root class="w-80">
			<Textarea.Input
				bind:value={charLimited}
				{maxlength}
				placeholder="Max 120 characters…"
				rows={4}
			/>
		</Textarea.Root>
		<p class="text-muted-foreground text-xs">{charLimited.length}/{maxlength}</p>
	</div>
</Story>

<!-- Real-world: a support ticket form card with label, hint, counter, and submit. -->
<Story name="Support Request">
	{#snippet template()}
		<div class="w-96 rounded-xl border p-5">
			<h3 class="text-sm font-semibold">Contact support</h3>
			<p class="text-muted-foreground mb-4 text-xs">
				Describe the problem and we'll get back to you within a day.
			</p>
			<div class="flex flex-col gap-1.5">
				<Label>How can we help?</Label>
				<Textarea.Root class="w-full">
					<Textarea.Input
						bind:value={ticket}
						maxlength={ticketMax}
						placeholder="Steps to reproduce, what you expected, what happened…"
						rows={5}
					/>
				</Textarea.Root>
				<div class="text-muted-foreground flex items-center justify-between text-xs">
					<span>Include as much detail as you can.</span>
					<span class="tabular-nums">{ticket.length}/{ticketMax}</span>
				</div>
			</div>
			<div class="mt-4 flex justify-end">
				<Button disabled={ticket.trim().length === 0}>Send request</Button>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="No Resize (wrap off)" parameters={{ layout: 'fullscreen' }}>
	<div class="flex flex-col gap-4 p-4">
		<div class="flex flex-col gap-1">
			<Label>wrap="off"</Label>
			<Textarea.Root class="w-80">
				<Textarea.Input
					class="resize-none"
					wrap="off"
					placeholder="This textarea won't wrap long lines…"
					rows={4}
				/>
			</Textarea.Root>
		</div>
	</div>
</Story>
