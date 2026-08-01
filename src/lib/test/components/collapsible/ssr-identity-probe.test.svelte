<script lang="ts">
	import { Collapsible } from '$ixirjs/ui/components/collapsible';
	import { Dialog } from '$ixirjs/ui/components/dialog';
</script>

<Collapsible.Root>
	<Collapsible.Header>header</Collapsible.Header>
	<Collapsible.Body>body</Collapsible.Body>
</Collapsible.Root>

<Collapsible.Root id="explicit-id">
	<Collapsible.Header>header</Collapsible.Header>
	<Collapsible.Body>body</Collapsible.Body>
</Collapsible.Root>

<Dialog.Root open>
	<Dialog.Content>content</Dialog.Content>
</Dialog.Root>
