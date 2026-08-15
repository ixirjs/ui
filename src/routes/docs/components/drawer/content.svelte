<script lang="ts">
	import type { DocContentProps } from '$docs/types';
	import { DocComponentPage, DocExample, DocSection } from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import {
		slideoverRootProps,
		slideoverContentProps,
		slideoverHeaderProps,
		drawerBodyProps
	} from './props';
	import { metadata } from './shared';

	let { contentType = 'html', ex }: DocContentProps = $props();

	const apiSections: PropsSection[] = [
		{ label: 'Drawer.Root', presetKey: 'drawer', props: slideoverRootProps },
		{ label: 'Drawer.Content', presetKey: 'drawer.content', props: slideoverContentProps },
		{ label: 'Drawer.Header', presetKey: 'drawer.header', props: slideoverHeaderProps },
		{ label: 'Drawer.Body', presetKey: 'drawer.body', props: drawerBodyProps }
	];
</script>

<DocComponentPage {contentType} {metadata} {apiSections}>
	{#snippet examples()}
		<DocExample
			title="Notifications Drawer"
			description="Right-side drawer showing a notification list."
			{...ex('./examples/notifications.svelte')}
		/>

		<DocExample
			title="Navigation Drawer"
			description="Left-side drawer used as a mobile nav menu."
			{...ex('./examples/navigation.svelte')}
		/>
	{/snippet}

	{#snippet extra()}
		<DocSection title="Portal containment">
			Drawer content resolves an explicit <code>portal</code>, then an ambient portal, then
			<code>root.l0</code>. The chosen portal supplies the containment and stacking boundary for the
			drawer and nested overlays.
		</DocSection>
	{/snippet}
</DocComponentPage>
