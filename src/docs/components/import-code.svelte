<script lang="ts">
	import CodeBlock from './code-block.svelte';

	type Props = {
		packageName: string;
		importCode: string;
	};

	let { packageName, importCode }: Props = $props();

	let importCopySuccess = $state(false);
	let installCopySuccess = $state(false);

	const installCmd = $derived(`npm install ${packageName}`);

	function copy(text: string, setter: (v: boolean) => void) {
		navigator.clipboard.writeText(text);
		setter(true);
		setTimeout(() => setter(false), 2000);
	}
</script>

<div class="space-y-2">
	<!-- Install -->
	<div class="border-white/[0.06] group relative overflow-hidden rounded-lg border">
		<div class="absolute top-2.5 right-3 z-10 flex items-center gap-2">
			<span class="text-[11px] text-white/40">bash</span>
			<button
				class="text-white/40 transition-opacity hover:text-white/90"
				onclick={() => copy(installCmd, (v) => (installCopySuccess = v))}
				aria-label="Copy install command"
			>
				{#if installCopySuccess}
					<svg
						class="h-3.5 w-3.5 text-green-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
				{:else}
					<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
						/>
					</svg>
				{/if}
			</button>
		</div>
		<CodeBlock lang="bash" code={installCmd} showLeftBorder={false} />
	</div>

	<!-- Import -->
	<div class="border-white/[0.06] group relative overflow-hidden rounded-lg border">
		<div class="absolute top-2.5 right-3 z-10 flex items-center gap-2">
			<span class="text-[11px] text-white/40">ts</span>
			<button
				class="text-white/40 transition-opacity hover:text-white/90"
				onclick={() => copy(importCode, (v) => (importCopySuccess = v))}
				aria-label="Copy import statement"
			>
				{#if importCopySuccess}
					<svg
						class="h-3.5 w-3.5 text-green-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
				{:else}
					<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
						/>
					</svg>
				{/if}
			</button>
		</div>
		<CodeBlock lang="typescript" code={importCode} showLeftBorder={false} />
	</div>
</div>
