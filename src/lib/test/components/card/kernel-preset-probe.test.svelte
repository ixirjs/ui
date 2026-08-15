<script lang="ts">
	import { Card } from '$ixirjs/ui/components/card';
	import { defaultPreset, setPreset } from '$ixirjs/ui/preset';
	setPreset({
		...defaultPreset,
		'card.title': () => ({ class: 'kernel-custom-title', attrs: { 'data-rich-preset': 'yes' } })
	});
</script>

<Card.Root>
	<Card.Header><Card.Title>Title</Card.Title></Card.Header>
	<Card.Body>Body</Card.Body>
</Card.Root>
