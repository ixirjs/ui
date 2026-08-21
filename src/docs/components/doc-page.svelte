<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setDocMode, type DocMode } from '$docs/context/doc-mode.svelte';
	import Breadcrumb from './breadcrumb.svelte';
	import PageHeader from './page-header.svelte';
	import PageNavigation from './page-navigation.svelte';
	import { FrontMatter } from '$docs/md/components';
	import type { Frontmatter } from '$docs/md/frontmatter';
	import { newLine } from '$docs/md/template';

	let {
		contentType = 'html',
		title,
		description,
		status = undefined,
		kind = undefined,
		depth = undefined,
		llms = false,
		breadcrumbs = [],
		prev = undefined,
		next = undefined,
		frontmatter = undefined,
		children
	}: {
		contentType?: DocMode;
		title: string;
		description: string;
		status?: 'stable' | 'beta' | 'experimental' | 'deprecated' | undefined;
		kind?: string | undefined;
		depth?: string | undefined;
		llms?: boolean;
		breadcrumbs?: { label: string; href?: string }[];
		prev?: { label: string; href: string } | undefined;
		next?: { label: string; href: string } | undefined;
		frontmatter?: Frontmatter;
		children: Snippet;
	} = $props();

	$effect(() => {
		setDocMode(contentType);
	});
</script>

{#if contentType === 'html'}
	<div class="animate-page-in">
		<Breadcrumb items={breadcrumbs} />
		<PageHeader {title} {description} {status} {kind} {depth} {llms} />
		{@render children()}
		<PageNavigation {prev} {next} />
	</div>
{:else}
	{#if frontmatter}
		<FrontMatter {frontmatter} />
	{/if}

	# {title}

	{description}{newLine()}

	{@render children()}
{/if}
