<script lang="ts">
	import { ProgressCircular, ProgressLinear } from '$ixirjs/ui';
	import { setPreset } from '$ixirjs/ui/preset';

	setPreset({
		'progress.linear.track': () => ({
			class: 'linear-track-theme',
			attrs: { 'data-track-theme': 'linear' }
		}),
		'progress.linear.fill': () => ({
			class: 'linear-fill-theme',
			attrs: { 'data-fill-theme': 'linear' }
		}),
		'progress.circular.track': () => ({
			class: 'circular-track-theme',
			attrs: { 'data-track-theme': 'circular' }
		}),
		'progress.circular.fill': () => ({
			class: 'circular-fill-theme',
			attrs: { 'data-fill-theme': 'circular' }
		})
	});
</script>

<ProgressLinear data-testid="linear" value={50} />
<ProgressCircular data-testid="circular" value={50} />
