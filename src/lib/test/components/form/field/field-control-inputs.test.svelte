<script lang="ts">
	import { Field, Input } from '$ixirjs/ui';

	let text = $state('hello');
	let files = $state<File[]>([new File(['content'], 'fixture.txt', { type: 'text/plain' })]);
</script>

<Field.Root name="text">
	<Input.Root>
		<Field.Control base={Input.TextControl} bind:value={text} data-testid="text-control" />
	</Input.Root>
</Field.Root>

<Field.Root name="upload">
	<Input.Root>
		<Field.Control
			base={Input.FileControl}
			bind:files
			accept="text/plain"
			data-testid="file-control"
		/>
	</Input.Root>
</Field.Root>
