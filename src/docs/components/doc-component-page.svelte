<script lang="ts">
	import type { Snippet } from 'svelte';
	import DocPage from './doc-page.svelte';
	import DocSection from './doc-section.svelte';
	import DocInstallation from './doc-installation.svelte';
	import DocAccessibility from './doc-accessibility.svelte';
	import DocCode from './doc-code.svelte';
	import DocOnly from './doc-only.svelte';
	import type { DocMode } from '$docs/context/doc-mode.svelte';
	import type { Frontmatter } from '$docs/md/frontmatter';
	import { newLine } from '$docs/md/template';
	import type { ComponentDocMeta, UseCase, ComponentSummary } from '$docs/types';

	let {
		contentType = 'html',
		metadata,
		frontmatter,
		prev,
		next,
		// Optional content appended inside the Installation section (e.g. DocCallout, warnings).
		installationNote,
		// Overrides the Preset Configuration section body; hides the section if absent with no presetCode.
		preset,
		// Content of the Examples section — wrap each example in <DocExample>.
		examples,
		// Arbitrary sections inserted between Examples and API Reference — wrap in <DocSection>.
		extra,
		// Content of the API Reference section — compose with <DocPropsSection> and <DocProps>.
		apiReference,
		// Full content override — bypasses all auto-rendered sections (e.g. for Input).
		children,
	}: {
		contentType?: DocMode;
		metadata: ComponentDocMeta;
		frontmatter: Frontmatter;
		prev: { label: string; href: string };
		next: { label: string; href: string };
		installationNote?: Snippet;
		preset?: Snippet;
		examples?: Snippet;
		extra?: Snippet;
		apiReference?: Snippet;
		children?: Snippet;
	} = $props();

	const showPreset = $derived(preset !== undefined || Boolean(metadata.presetCode));
	const isCompound = $derived(metadata.componentType === 'compound');
	const hasMarkdownHeader = $derived(
		isCompound && ((metadata.useCases?.length ?? 0) > 0 || (metadata.componentsSummary?.length ?? 0) > 0)
	);
</script>

<DocPage
	{contentType}
	title={metadata.componentTitle}
	description={metadata.componentDescription}
	status={metadata.status}
	llms={true}
	breadcrumbs={metadata.breadcrumbs}
	{prev}
	{next}
	{frontmatter}
>
	{#if children}
		{@render children()}
	{:else}
		{#if hasMarkdownHeader}
			<DocOnly for="markdown">
				**Type**: Compound Component

				{#if metadata.useCases?.length}
## Use Cases

				{#each metadata.useCases as uc, i (i)}
- **{uc.title}**: {uc.description}
				{/each}
				{/if}
				{#if metadata.componentsSummary?.length}
## Components

				{#each metadata.componentsSummary as comp, i (i)}
- **{comp.name}**: {comp.description}
				{/each}
				{/if}
			</DocOnly>
		{/if}

		<DocSection title="Installation">
			<DocInstallation packageName={metadata.packageName} importCode={metadata.importCode} />
			{@render installationNote?.()}
		</DocSection>

		{#if showPreset}
			<DocSection title="Preset Configuration" subtitle="Customize the appearance using presets">
				{#if preset}
					{@render preset()}
				{:else if metadata.presetCode}
					<DocCode code={metadata.presetCode} lang="typescript" />
				{/if}
			</DocSection>
		{/if}

		{#if examples}
			<DocSection title="Examples" subtitle="Explore different variations and use cases">
				{@render examples()}
			</DocSection>
		{/if}

		{@render extra?.()}

		{#if apiReference}
			<DocSection title="API Reference">
				{@render apiReference()}
			</DocSection>
		{/if}

		<DocSection title="Accessibility">
			<DocAccessibility features={metadata.accessibility} />
		</DocSection>

		<DocOnly for="markdown">
{newLine(2)}## License

MIT License
		</DocOnly>
	{/if}
</DocPage>
