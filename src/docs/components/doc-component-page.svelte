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
	import { breadcrumbsFor, relatedTo, siblingsOf, slugFor } from '$docs/registry';
	import DocAnatomy from './doc-anatomy.svelte';
	import DocPropsTabs from './doc-props-tabs.svelte';
	import type { ComponentDocMeta, PropsSection } from '$docs/types';

	let {
		contentType = 'html',
		metadata,
		// Derived from `metadata` when absent — see `resolvedFrontmatter`. Fifty-one pages wrote the
		// same eight-line literal in which only `depth` carried information.
		frontmatter,
		// Rendered inside the API Reference section when no `apiReference` snippet is given. Fifty
		// pages passed a snippet whose entire body was `<DocPropsTabs {sections} />`.
		apiSections,
		// Both default to the registry, keyed on `frontmatter.id` (which is the page's slug).
		// Every page used to hand-wire these; 41 prev/next pairs meant inserting a component was a
		// three-file edit and a missed one broke the chain silently.
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
		children
	}: {
		contentType?: DocMode;
		metadata: ComponentDocMeta;
		frontmatter?: Frontmatter;
		apiSections?: PropsSection[];
		prev?: { label: string; href: string };
		next?: { label: string; href: string };
		installationNote?: Snippet;
		preset?: Snippet;
		examples?: Snippet;
		extra?: Snippet;
		apiReference?: Snippet;
		children?: Snippet;
	} = $props();

	// A page states only what is not derivable: `id` is the directory slug, `title` the component
	// title, `category` always `components`, `prerequisites`/`related` empty on 47 of 51 pages. The
	// five that differ pass `frontmatter` explicitly and it wins whole — never half-derived.
	const resolvedFrontmatter: Frontmatter = $derived(
		frontmatter ?? {
			id: slugFor(metadata) ?? '',
			title: metadata.componentTitle,
			category: 'components',
			depth: metadata.depth ?? 'beginner',
			prerequisites: [],
			related: []
		}
	);

	const siblings = $derived(siblingsOf(resolvedFrontmatter.id));
	const asLink = (entry?: { title: string; href: string }) =>
		entry && { label: entry.title, href: entry.href };

	const prevLink = $derived(prev ?? asLink(siblings.prev));
	const nextLink = $derived(next ?? asLink(siblings.next));
	const trail = $derived(metadata.breadcrumbs ?? breadcrumbsFor(metadata.componentTitle));

	const showPreset = $derived(preset !== undefined || Boolean(metadata.presetCode));
	const isCompound = $derived(metadata.componentType === 'compound');
	const parts = $derived(metadata.componentsSummary ?? []);
	// Siblings in the same category, never `frontmatter.related`: that field mixes guide slugs with
	// component slugs and nothing checks it, so three of its four uses resolve to nothing.
	const related = $derived(relatedTo(resolvedFrontmatter.id));
	// The two neutral pills beside the status chip, per the design's component header.
	const kindLabel = $derived(metadata.componentType ?? 'simple');
	const depthLabel = $derived(resolvedFrontmatter.depth);
	const hasMarkdownHeader = $derived(isCompound || (metadata.useCases?.length ?? 0) > 0);
</script>

<DocPage
	{contentType}
	title={metadata.componentTitle}
	description={metadata.componentDescription}
	status={metadata.status}
	kind={kindLabel}
	depth={depthLabel}
	llms={true}
	breadcrumbs={trail}
	prev={prevLink}
	next={nextLink}
	frontmatter={resolvedFrontmatter}
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
					<DocCode code={metadata.presetCode} lang="typescript" filepath="src/lib/preset.ts" />
				{/if}
			</DocSection>
		{/if}

		{#if examples}
			<DocSection title="Examples" subtitle="Explore different variations and use cases">
				{@render examples()}
			</DocSection>
		{/if}

		{@render extra?.()}

		{#if parts.length > 0}
			<DocSection title="Anatomy">
				<DocAnatomy
					{parts}
					intro="{parts.length} parts, coordinated by one {metadata.componentTitle} Bond."
				/>
			</DocSection>
		{/if}

		{#if apiReference || apiSections}
			<DocSection title="API Reference">
				{#if apiReference}
					{@render apiReference()}
				{:else if apiSections}
					<DocPropsTabs sections={apiSections} />
				{/if}
			</DocSection>
		{/if}

		<DocSection title="Accessibility">
			<DocAccessibility features={metadata.accessibility} />
		</DocSection>

		{#if related.length > 0}
			<DocOnly for="html">
				<DocSection title="Related">
					<div class="grid grid-cols-3 gap-2.5 max-[900px]:grid-cols-1">
						{#each related as item (item.href)}
							<a
								href={item.href}
								class="border-border hover:border-border-strong text-foreground flex flex-col gap-1 rounded-[9px] border p-[13px] transition-colors"
							>
								<span class="text-sm font-medium">{item.title}</span>
								<span class="text-muted-foreground text-[12.5px] leading-[1.5]">{item.summary}</span
								>
							</a>
						{/each}
					</div>
				</DocSection>
			</DocOnly>
		{/if}

		<DocOnly for="markdown">
			{newLine(2)}## License MIT License
		</DocOnly>
	{/if}
</DocPage>
