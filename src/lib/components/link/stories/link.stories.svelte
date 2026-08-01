<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Link from '../link.svelte';

	const { Story } = defineMeta({
		title: 'Atoms/Link',
		parameters: { layout: 'centered' },
		args: {
			href: '#',
			target: '_self',
			disabled: false
		},
		argTypes: {
			href: {
				control: 'text',
				description: 'The URL the link points to'
			},
			target: {
				control: 'select',
				options: ['_self', '_blank', '_parent', '_top'],
				description: 'Where to open the linked document'
			},
			disabled: {
				control: 'boolean',
				description: 'Disable the link'
			}
		}
	});
</script>

<!-- Basic — drive href / target / disabled from the Storybook controls panel. -->
<Story name="Basic">
	{#snippet template(args)}
		<Link {...args}>Visit our website</Link>
	{/snippet}
</Story>

<!--
	External: pair `target="_blank"` with `rel="noopener noreferrer"` so the opened
	tab can't access `window.opener`. Any anchor attribute passes straight through.
-->
<Story name="External">
	<div class="flex flex-col gap-2">
		<Link href="https://example.com" target="_blank" rel="noopener noreferrer">
			Open in new tab ↗
		</Link>
		<code class="bg-muted/50 text-muted-foreground rounded-md border px-2 py-1 text-xs font-mono">
			target="_blank" rel="noopener noreferrer"
		</code>
	</div>
</Story>

<!-- Inline: Link inherits the surrounding text size and color, only restyling itself. -->
<Story name="Inline Text">
	<p class="text-muted-foreground max-w-sm text-sm leading-relaxed">
		Read our
		<Link href="#">terms of service</Link>
		and
		<Link href="#">privacy policy</Link>
		before continuing. Links sit naturally within a paragraph and underline on hover.
	</p>
</Story>

<!-- Disabled: dims the link and signals non-interactivity to assistive tech. -->
<Story name="Disabled">
	<div class="flex items-center gap-6">
		<Link href="#">Enabled link</Link>
		<Link href="#" disabled class="text-muted-foreground pointer-events-none opacity-50">
			Unavailable link
		</Link>
	</div>
</Story>
