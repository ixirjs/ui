<script lang="ts">
	import { Slider } from '$lib/components/slider';

	let progress = $state(30);
</script>

<div class="space-y-2">
	<Slider bind:value={progress} class="min-w-40">
		{#snippet thumbContent({ value: v })}
			<div class="bg-background border-border relative size-full rounded-full border shadow-sm">
				<div class="bg-primary absolute inset-1 rounded-full"></div>
				<span class="sr-only">Current value: {v}</span>
			</div>
		{/snippet}

		{#snippet trackContent({ percent })}
			<div class="bg-muted relative h-2 w-full rounded-full">
				<div
					class="bg-primary absolute inset-y-0 left-0 rounded-full"
					style={`width: ${percent}%`}
				></div>
			</div>
		{/snippet}
	</Slider>
	<p class="text-muted-foreground text-sm">Progress: {progress}%</p>
</div>
