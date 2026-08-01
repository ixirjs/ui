<script lang="ts">
	import { Button } from '$ixirjs/ui';
	import { setPreset } from '$ixirjs/ui/preset';

	setPreset({
		button: () => ({
			class: 'preset-button',
			attrs: { 'data-layer': 'preset', type: 'submit' }
		})
	});
</script>

<Button data-testid="default" class="consumer-button" data-layer="consumer">Save</Button>
<Button data-testid="reset" type="reset">Reset</Button>
