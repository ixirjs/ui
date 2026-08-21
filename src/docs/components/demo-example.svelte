<script lang="ts">
	// The Preview / Code panel. Tabs are a segmented control in the toolbar; the preview sits on the
	// subtle ground and the code tab on the code ground, exactly as the design lays them out.
	import type { Snippet } from 'svelte';
	import type { ExampleLoader } from '$docs/utils/example-loader';
	import CodeBlock from './code-block.svelte';
	import PresetScope from '$docs/preset-scope.svelte';
	import { demoPresets } from '$docs/demo-presets';
	import { createCopier } from '$docs/utils';

	type Props = {
		title: string;
		description?: string | undefined;
		code?: string | undefined;
		// Lazy example-file loader — renders the .svelte file in the preview area
		component?: ExampleLoader | undefined;
		children?: Snippet;
	};

	let { title, description, code, component, children }: Props = $props();

	let activeTab = $state<'preview' | 'code'>('preview');
	// Presets install at init, so switching one remounts the scope — see `PresetScope`.
	let presetKey = $state(demoPresets[0]!.key);
	const activePreset = $derived(demoPresets.find((p) => p.key === presetKey) ?? demoPresets[0]!);
	const copier = createCopier();

	const TAB =
		'cursor-pointer rounded-[5px] border-0 bg-transparent px-[11px] py-1 text-xs font-medium transition-colors';
</script>

<div class="flex flex-col gap-2">
	<div class="flex flex-col gap-0.5">
		<h3 class="text-foreground m-0 text-sm font-medium">{title}</h3>
		{#if description}
			<p class="text-muted-foreground m-0 text-[13px] leading-[1.55]">{description}</p>
		{/if}
	</div>

	<div class="border-border bg-surface overflow-hidden rounded-[11px] border">
		<div class="border-border flex flex-wrap items-center gap-2.5 border-b px-2.5 py-2">
			<div class="border-border flex gap-0.5 rounded-[7px] border p-0.5">
				<button
					type="button"
					class={[
						TAB,
						activeTab === 'preview'
							? 'bg-surface-2 text-foreground'
							: 'text-muted-foreground hover:text-foreground'
					]}
					onclick={() => (activeTab = 'preview')}>Preview</button
				>
				{#if code}
					<button
						type="button"
						class={[
							TAB,
							activeTab === 'code'
								? 'bg-surface-2 text-foreground'
								: 'text-muted-foreground hover:text-foreground'
						]}
						onclick={() => (activeTab = 'code')}>Code</button
					>
				{/if}
			</div>

			<div class="ml-1 flex items-center gap-1.5">
				<span class="text-fg-faint text-[11px]">preset</span>
				{#each demoPresets as option (option.key)}
					<button
						type="button"
						onclick={() => (presetKey = option.key)}
						aria-pressed={presetKey === option.key}
						class={[
							'cursor-pointer rounded-md border bg-transparent px-2 py-[3px] text-[11px] transition-colors',
							presetKey === option.key
								? 'border-accent-line bg-accent-soft text-primary'
								: 'border-border text-muted-foreground hover:border-border-strong'
						]}>{option.label}</button
					>
				{/each}
			</div>
		</div>

		{#if activeTab === 'preview'}
			<!--
				`data-example-preview` is a stable hook for e2e: the docs shell's own chrome (the sidebar
				tree, the mode toggles) uses the same roles and ARIA attributes as the components being
				demonstrated, so an unscoped `getByRole` matches the navigation before the example.
				Scoping to this attribute keeps those tests pinned to the demo without depending on
				layout classes.
			-->
			<div
				data-example-preview
				class="bg-bg-subtle flex min-h-[220px] items-center justify-center overflow-hidden p-8"
			>
				{#key presetKey}
					<PresetScope preset={activePreset.preset}>
						{#if component}
							{#await component()}
								<div class="bg-muted h-8 w-32 animate-pulse rounded"></div>
							{:then mod}
								{@const Example = mod.default}
								<Example />
							{/await}
						{:else if children}
							{@render children()}
						{/if}
					</PresetScope>
				{/key}
			</div>
		{:else if code}
			<div class="bg-code-bg">
				<div class="border-border flex items-center justify-between border-b px-3 py-2">
					<span class="text-muted-foreground font-mono text-[11px]">svelte</span>
					<button
						type="button"
						onclick={() => copier.run(code)}
						class="border-border bg-surface text-muted-foreground hover:text-foreground cursor-pointer rounded-md border px-2 py-[3px] text-[11px] transition-colors"
						>{copier.label()}</button
					>
				</div>
				<CodeBlock lang="svelte" {code} showLeftBorder={false} />
			</div>
		{/if}
	</div>
</div>
