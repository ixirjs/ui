<script module lang="ts">
	export type PageContent = {
		title: string;
		href?: string;
		disabled?: boolean;
		children?: PageContent[];
	};
</script>

<script lang="ts">
	import { Tree } from '$lib/components/tree';
	import { Scrollable } from '$lib/components/scrollable';
	import { goto } from '$app/navigation';

	let { data, pathname = '', mobile = false } = $props();

	function isActive(current: string, href: string) {
		// exact match OR child page (but guard against short prefixes like /docs matching /docs/*)
		return current === href || (href.length > 5 && current.startsWith(href + '/'));
	}
</script>

{#snippet tree(item: PageContent)}
	{#if item.children && item.children.length > 0}
		<Tree.Root open>
			<Tree.Header
				as="a"
				href={item.href}
				class="text-muted-foreground sticky top-0 z-10 mb-1 px-2 py-1 text-xs font-semibold uppercase tracking-widest bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80"
				disabled={item.disabled === true}
				onpointerdown={(ev) => {
					ev.preventDefault();
					if (item.href) goto(item.href);
				}}>{item.title}</Tree.Header
			>
			<Tree.Body class="flex flex-col">
				{#each item.children as child, i (i)}
					{@render tree(child)}
				{/each}
			</Tree.Body>
		</Tree.Root>
	{:else if item.href}
		<a
			href={item.disabled ? undefined : item.href}
			class={[
				'relative flex items-center rounded-md px-2 py-1.5 text-sm transition-colors',
				isActive(pathname, item.href)
					? 'text-foreground font-medium'
					: 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
				item.disabled ? 'pointer-events-none opacity-50' : ''
			]}
			aria-disabled={item.disabled}
		>
			{#if isActive(pathname, item.href)}
				<span class="bg-primary absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full"
				></span>
			{/if}
			<span class="pl-2">{item.title}</span>
		</a>
	{:else}
		<div class="px-2 py-1.5 text-sm">{item.title}</div>
	{/if}
{/snippet}

{#snippet sidebarContent()}
	<Scrollable.Container>
		<Scrollable.Content class={['flex flex-col gap-5', mobile ? 'px-2' : 'py-6 px-3']}>
			{#each data as item, i (i)}
				{@render tree(item)}
			{/each}
		</Scrollable.Content>
	</Scrollable.Container>

	<Scrollable.Track
		class="inset-y-8 opacity-0 group-hover:opacity-100 duration-500 transition-opacity overflow-clip"
		orientation="vertical"
	>
		<Scrollable.Thumb
			orientation="vertical"
			class="left-[50%] w-2 origin-center translate-x-[-50%] rounded-none transition-colors"
		/>
	</Scrollable.Track>
{/snippet}

{#if mobile}
	<Scrollable.Root as="aside" class="h-full w-full docs-scroll group">
		{@render sidebarContent()}
	</Scrollable.Root>
{:else}
	<aside class="self-start sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 lg:block">
		<Scrollable.Root as="div" class="h-full w-full docs-scroll group">
			{@render sidebarContent()}
		</Scrollable.Root>
	</aside>
{/if}
