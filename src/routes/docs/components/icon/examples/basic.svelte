<script lang="ts">
	import { Icon } from '$lib/components/icon';
</script>

<!-- No icon set is bundled. Pass any SVG as children, or a component via `src`. -->
<div class="flex items-center gap-3">
	<Icon class="size-5" aria-label="Done">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<polyline points="20 6 9 17 4 12"></polyline>
		</svg>
	</Icon>
	<span class="text-sm">Saved</span>
</div>
