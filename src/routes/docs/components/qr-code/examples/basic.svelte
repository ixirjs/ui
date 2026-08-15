<script lang="ts">
	import { QRCode } from '$lib/components/qr-code';
</script>

<div class="flex flex-col gap-2">
	<QRCode
		value="https://github.com/ixirjs/ui"
		class="size-40"
		aria-label="Link to the repository"
	/>
	<code class="text-muted-foreground text-xs">https://github.com/ixirjs/ui</code>
</div>
