<script lang="ts">
	import { Slider } from '$lib/components/slider';

	let volume = $state(65);
</script>

<div class="flex h-48 items-end gap-4">
	<Slider bind:value={volume} orientation="vertical" class="h-40" />
	<p class="text-muted-foreground text-sm">
		Volume: <span class="inline-flex min-w-[5ch]">{volume}%</span>
	</p>
</div>
