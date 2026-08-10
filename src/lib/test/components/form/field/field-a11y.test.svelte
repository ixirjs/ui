<script lang="ts">
	import { Field, Input } from '$ixirjs/ui';

	let { value = $bindable('') }: { value?: string } = $props();
</script>

<Field.Root name="probe" required>
	<Field.Label>Name</Field.Label>
	<Input.Root>
		<Field.Control base={Input.TextControl} bind:value data-testid="probe-control" />
	</Input.Root>
	<Field.HelperText>Your full name</Field.HelperText>
</Field.Root>
