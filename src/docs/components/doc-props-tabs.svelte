<script lang="ts">
	import { Tabs, Tab } from '$lib/components/tabs';
	import { getDocMode } from '$docs/context/doc-mode.svelte';
	import { PropsTable } from '$docs/md/components';
	import Props from '$docs/props-datagrid.svelte';
	import { newLine } from '$docs/md/template';
	import type { PropsSection } from '$docs/types';

	let { sections }: { sections: PropsSection[] } = $props();

	const mode = getDocMode();

	function toValue(label: string) {
		return label
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');
	}

	const resolved = $derived(sections.map((s) => ({ ...s, value: s.value ?? toValue(s.label) })));
	const initialValue = $derived(resolved[0]?.value ?? '');
</script>

{#if mode === 'html'}
	<Tabs.Root value={initialValue} class="mt-2">
		<Tabs.Header class="border-b overflow-x-auto scrollbar-none">
			{#each resolved as section (section.value)}
				<Tab.Root value={section.value}>
					<Tab.Header class="px-3 py-2 text-xs">{section.label}</Tab.Header>
					<Tab.Body>
						{#if section.presetKey}
							<p class="text-muted-foreground mb-3 text-xs">
								Preset key: <code class="bg-muted rounded px-1 py-0.5">{section.presetKey}</code>
							</p>
						{/if}
						<Props data={section.props} />
					</Tab.Body>
				</Tab.Root>
			{/each}
		</Tabs.Header>
		<Tabs.Body class="max-w-full overflow-hidden">
			<Tabs.Content class="pt-4 max-w-full overflow-hidden" />
		</Tabs.Body>
	</Tabs.Root>
{:else}
	{#each resolved as section (section.value)}
		{newLine(2)}### {section.label}
		{#if section.presetKey}
			**Preset Key:** `{section.presetKey}`
		{/if}
		<PropsTable props={section.props} />
	{/each}
{/if}
