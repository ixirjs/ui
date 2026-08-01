<script lang="ts">
	import { Button } from '$lib/components/button';

	interface Props {
		// Path to the llms.txt endpoint for this page
		llmPath: string;
	}

	let { llmPath }: Props = $props();

	async function copyMarkdown() {
		try {
			const response = await fetch(llmPath);
			const text = await response.text();
			await navigator.clipboard.writeText(text);
			// Could add toast notification here
			alert('Markdown copied to clipboard!');
		} catch (error) {
			console.error('Failed to copy markdown:', error);
			alert('Failed to copy markdown');
		}
	}
</script>

<div class="border-border bg-muted/30 flex items-center gap-2 rounded-lg border p-3">
	<div class="flex-1">
		<p class="text-sm font-medium">LLM-Friendly Documentation</p>
		<p class="text-muted-foreground text-xs">
			Access this page in a format optimized for AI tools and language models
		</p>
	</div>
	<div class="flex gap-2">
		<Button variant="outline" size="sm" onclick={copyMarkdown}>
			<svg
				class="mr-1.5 h-4 w-4"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
				></path>
			</svg>
			Copy Markdown
		</Button>
		<Button variant="outline" size="sm" as="a" href={llmPath} target="_blank">
			<svg
				class="mr-1.5 h-4 w-4"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
				></path>
			</svg>
			View llms.txt
		</Button>
	</div>
</div>
