<script lang="ts">
	import { Textarea } from '$ixirjs/ui';
	import { setPreset } from '$ixirjs/ui/preset';

	setPreset({
		textarea: () => ({
			class: 'textarea-theme',
			attrs: { 'data-theme': 'textarea' }
		})
	});
</script>

<Textarea.Root>
	<Textarea.Input data-testid="textarea" />
</Textarea.Root>
