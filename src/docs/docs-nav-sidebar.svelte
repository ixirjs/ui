<script lang="ts">
	// The docs sidebar: sticky on desktop, a left Drawer below 900px. One rendering for both — the
	// drawer wraps it in its own scroll surface rather than restyling every row.
	import { animateDrawerContent, Drawer } from '$lib/components/drawer';
	import { DURATION } from '$ixirjs/ui/authoring';
	import { isActive, navGroups } from './nav';

	type Props = { pathname: string; open?: boolean; ondismiss?: () => void };

	let { pathname, open = $bindable(false), ondismiss }: Props = $props();
</script>

<!-- The gap lives inside the snippet: Drawer.Content's preset owns its own flex classes, so a gap
     set on the call site there is silently dropped. -->
{#snippet groups()}
	<div class="flex flex-col gap-[22px]">
		{#each navGroups as group (group.title)}
			<div class="flex flex-col gap-px">
				<div class="flex items-baseline gap-[7px] px-2 pb-[7px]">
					<span class="text-muted-foreground text-[11px] font-semibold tracking-[0.07em] uppercase"
						>{group.title}</span
					>
					<span class="text-fg-faint font-mono text-[10px]">{group.items.length}</span>
				</div>
				{#if group.note}
					<p class="text-fg-faint m-0 mb-1.5 px-2 text-[11px] leading-[1.45]">{group.note}</p>
				{/if}
				{#each group.items as item (item.href)}
					{@const active = isActive(pathname, item.href)}
					<a
						href={item.href}
						aria-current={active ? 'page' : undefined}
						class={[
							'flex items-center gap-2 border-l-2 px-2 py-[5px] text-[13.5px] transition-colors',
							active
								? 'text-foreground bg-accent-soft border-l-primary font-medium'
								: 'text-muted-foreground hover:text-foreground border-l-transparent'
						]}
					>
						<span class="min-w-0 truncate">{item.label}</span>
					</a>
				{/each}
			</div>
		{/each}
	</div>
{/snippet}

<!-- Desktop -->
<aside
	class="docs-scroll sticky top-14 hidden max-h-[calc(100vh-3.5rem)] overflow-y-auto pt-7 pb-12 min-[900px]:block"
	aria-label="Documentation"
>
	{@render groups()}
</aside>

<!-- Below 900px -->
<Drawer.Root
	bind:open
	onopenchange={(nextOpen) => {
		if (!nextOpen) ondismiss?.();
	}}
	side="left"
	class="z-50 min-[900px]:hidden"
>
	{#snippet children({ drawer })}
		<Drawer.Backdrop
			class={[
				'bg-scrim z-90 transition-opacity duration-150',
				drawer.props.open ? 'opacity-100' : 'opacity-0'
			]}
		/>
		<Drawer.Content
			class="bg-background border-border docs-scroll z-90 w-[280px] overflow-y-auto border-r px-3.5 py-[18px]"
			animate={animateDrawerContent({ duration: DURATION.smooth / 1000 })}
		>
			{@render groups()}
		</Drawer.Content>
	{/snippet}
</Drawer.Root>
