<script lang="ts">
	const year = new Date().getFullYear();
</script>

<footer class="border-border mt-16 border-t">
	<div class="flex flex-col items-center justify-between gap-2 px-4 py-6 sm:flex-row">
		<p class="text-muted-foreground text-xs">
			© {year} Svelte Atoms. Open source under the MIT license.
		</p>
		<p class="text-muted-foreground text-xs">Built with Svelte 5 · Runes · TailwindCSS</p>
	</div>
</footer>
