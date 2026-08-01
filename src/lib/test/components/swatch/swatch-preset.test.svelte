<script lang="ts">
	import { Swatch } from '$ixirjs/ui';
	import { setPreset } from '$ixirjs/ui/preset';

	setPreset({
		swatch: () => ({
			class: 'preset-swatch',
			attrs: { 'data-preset': 'swatch' }
		})
	});
</script>

<Swatch data-testid="swatch" color="rebeccapurple" class="consumer-swatch" />
