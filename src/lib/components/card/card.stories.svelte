<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Atoms/Card',
		parameters: { layout: 'centered' },
		args: {
			disabled: false
		},
		argTypes: {
			disabled: { control: 'boolean', description: 'Disable interaction and dim the card' }
		}
	});
</script>

<script lang="ts">
	import { Card } from '.';

	// Live readout for the Clickable story — house convention prefers an on-screen
	// counter over alert()/console.log so the interaction is visible in the canvas.
	let clickCount = $state(0);
</script>

<Story name="Basic">
	{#snippet template(args)}
		<Card.Root class="max-w-sm" {...args}>
			<Card.Header>
				<Card.Title>Card Title</Card.Title>
				<Card.Description
					>This is a card description that provides additional context.</Card.Description
				>
			</Card.Header>
			<Card.Body>
				<p>
					This is the main content area of the card. You can put any content here including text,
					images, or other components.
				</p>
			</Card.Body>
			<Card.Footer>
				<button
					class="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-3 py-1 text-sm transition-colors"
					>Action</button
				>
				<button
					class="border-border hover:bg-foreground/5 active:bg-foreground/10 rounded border px-3 py-1 text-sm"
					>Cancel</button
				>
			</Card.Footer>
		</Card.Root>
	{/snippet}
</Story>

<Story name="With Media">
	<Card.Root class="max-w-sm">
		<Card.Media>
			<img
				src="https://picsum.photos/seed/landscape/400/200"
				alt="Beautiful landscape"
				class="h-48 w-full object-cover"
			/>
		</Card.Media>
		<Card.Header>
			<Card.Title>Beautiful Landscape</Card.Title>
			<Card.Subtitle>Photography</Card.Subtitle>
		</Card.Header>
		<Card.Body>
			<p>A stunning landscape photograph capturing the beauty of nature.</p>
		</Card.Body>
		<Card.Footer>
			<span class="text-sm text-muted-foreground">Posted 2 hours ago</span>
		</Card.Footer>
	</Card.Root>
</Story>

<Story name="Clickable">
	<Card.Root
		class="hover:bg-card/90 active:bg-card/80 max-w-sm cursor-pointer pb-4"
		onclick={() => clickCount++}
	>
		<Card.Header>
			<Card.Title>Clickable Card</Card.Title>
			<Card.Description>The whole card is the click target via Root's onclick.</Card.Description>
		</Card.Header>
		<Card.Body>
			<p>Click anywhere on this card to trigger the action.</p>
			<!-- Live readout: clicks land on the root regardless of where you press. -->
			<code class="text-muted-foreground mt-2 block text-sm">clicked {clickCount} time(s)</code>
		</Card.Body>
	</Card.Root>
</Story>

<Story name="Variants">
	<!--
		Variants differ along surface + border, not shadow alone — shadows are nearly
		invisible in dark mode, so each card stays distinct in both themes. Each card
		carries a Body so the header's divider separates real content, not empty space.
	-->
	<div class="grid grid-cols-2 gap-4">
		<Card.Root>
			<Card.Header>
				<Card.Title>Default Card</Card.Title>
				<Card.Description>Base: bg-card surface, hairline border, subtle shadow.</Card.Description>
			</Card.Header>
			<Card.Body>The neutral baseline every other variant departs from.</Card.Body>
		</Card.Root>

		<Card.Root class="border-foreground/30 border-2 bg-transparent shadow-none">
			<Card.Header>
				<Card.Title>Outlined Card</Card.Title>
				<Card.Description>Bold border, no fill, no shadow.</Card.Description>
			</Card.Header>
			<Card.Body>Reads as structure-only — useful on busy backgrounds.</Card.Body>
		</Card.Root>

		<Card.Root class="bg-muted border-none shadow-lg">
			<Card.Header>
				<Card.Title>Elevated Card</Card.Title>
				<Card.Description>Lighter raised surface plus a larger shadow.</Card.Description>
			</Card.Header>
			<Card.Body>Lifts off the page; pair with hover to suggest depth.</Card.Body>
		</Card.Root>

		<Card.Root class="bg-primary/10 border-primary/30 shadow-none">
			<Card.Header>
				<Card.Title>Filled Card</Card.Title>
				<Card.Description>Tonal accent fill with a matching border.</Card.Description>
			</Card.Header>
			<Card.Body>Draws attention — good for a primary or featured card.</Card.Body>
		</Card.Root>
	</div>
</Story>

<Story name="Disabled">
	<Card.Root class="max-w-sm pb-4" disabled>
		<Card.Header>
			<Card.Title>Disabled Card</Card.Title>
			<Card.Description>This card is disabled and cannot be interacted with.</Card.Description>
		</Card.Header>
		<Card.Body>
			<p>The card appears dimmed and is not clickable.</p>
		</Card.Body>
	</Card.Root>
</Story>
