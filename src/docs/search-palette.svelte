<script lang="ts">
	// ⌘K / Ctrl+K palette. Indexes the nav manifest, so a page added to `nav.ts` is searchable
	// without touching this file. Deliberately not a Dialog: the design's overlay is a bare
	// top-anchored sheet with its own scrim, and routing away is what closes it.
	import { goto } from '$app/navigation';
	import { allNavItems, navGroups } from './nav';

	type Result = (typeof allNavItems)[number];

	type Props = { open?: boolean; ondismiss?: () => void };

	let { open = $bindable(false), ondismiss }: Props = $props();

	let query = $state('');
	let index = $state(0);
	let inputEl = $state<HTMLInputElement | undefined>(undefined);

	// Suggested set when the query is empty — the head of each group, in reading order.
	const suggested = navGroups
		.flatMap((group) => allNavItems.filter((item) => item.group === group.title).slice(0, 2))
		.slice(0, 8);

	const results = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return suggested;
		return allNavItems
			.filter((item) => `${item.label} ${item.summary ?? ''}`.toLowerCase().includes(q))
			.slice(0, 9);
	});

	const countLabel = $derived(
		query.trim() ? (results.length === 1 ? '1 match' : `${results.length} matches`) : 'Suggested'
	);

	// Split a label around the matched run so the middle can be <mark>ed.
	function split(label: string) {
		const q = query.trim();
		const at = q ? label.toLowerCase().indexOf(q.toLowerCase()) : -1;
		if (at < 0) return { pre: label, mid: '', post: '' };
		return {
			pre: label.slice(0, at),
			mid: label.slice(at, at + q.length),
			post: label.slice(at + q.length)
		};
	}

	function close() {
		open = false;
		ondismiss?.();
	}

	function activate(item: Result) {
		close();
		goto(item.href);
	}

	function onkeydown(event: KeyboardEvent) {
		const n = results.length;
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			index = n ? (index + 1) % n : 0;
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			index = n ? (index - 1 + n) % n : 0;
		} else if (event.key === 'Home') {
			event.preventDefault();
			index = 0;
		} else if (event.key === 'End') {
			event.preventDefault();
			index = Math.max(0, n - 1);
		} else if (event.key === 'Enter') {
			event.preventDefault();
			const item = results[index];
			if (item) activate(item);
		} else if (event.key === 'Escape') {
			event.preventDefault();
			close();
		}
	}

	// Reset and focus each time the palette opens, never on every keystroke.
	$effect(() => {
		if (!open) return;
		query = '';
		index = 0;
		requestAnimationFrame(() => inputEl?.focus());
	});
</script>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		role="dialog"
		tabindex="-1"
		aria-modal="true"
		aria-label="Search documentation"
		onclick={close}
		class="animate-fade-in bg-scrim fixed inset-0 z-100 flex items-start justify-center px-4 pt-20 pb-4 backdrop-blur-[3px]"
	>
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div
			onclick={(event) => event.stopPropagation()}
			class="animate-pop-in bg-background border-border shadow-overlay w-full max-w-[640px] overflow-hidden rounded-xl border"
		>
			<div class="border-border flex items-center gap-[11px] border-b px-4 py-[13px]">
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					class="text-muted-foreground shrink-0"
					aria-hidden="true"
				>
					<circle cx="11" cy="11" r="8" />
					<path d="m21 21-4.3-4.3" />
				</svg>
				<input
					bind:this={inputEl}
					bind:value={query}
					oninput={() => (index = 0)}
					{onkeydown}
					type="text"
					placeholder="Search pages, components, guides…"
					aria-label="Search query"
					autocomplete="off"
					spellcheck="false"
					class="text-foreground min-w-0 flex-1 border-0 bg-transparent text-[15px] outline-none"
				/>
				<button
					type="button"
					onclick={() => {
						query = '';
						index = 0;
						inputEl?.focus();
					}}
					aria-label="Clear query"
					class={[
						'text-fg-faint hover:text-foreground flex cursor-pointer border-0 bg-transparent p-0.5',
						query ? '' : 'invisible'
					]}
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					>
						<path d="M18 6 6 18M6 6l12 12" />
					</svg>
				</button>
				<span
					class="border-border bg-kbd text-muted-foreground rounded border px-1.5 py-px font-mono text-[10px]"
					>esc</span
				>
			</div>

			<div class="docs-scroll max-h-[400px] overflow-y-auto p-1.5">
				{#if results.length === 0}
					<div class="px-5 py-7 text-center">
						<p class="text-foreground m-0 mb-1.5 text-sm">Nothing matches “{query}”</p>
						<p class="text-muted-foreground m-0 text-[13px]">
							Search covers page titles, component names and summaries.
						</p>
					</div>
				{/if}
				{#each results as item, i (item.href)}
					{@const parts = split(item.label)}
					{@const first = i === 0 || results[i - 1]!.group !== item.group}
					{#if first}
						<p
							class="text-fg-faint m-0 mt-2.5 mb-1 px-2.5 text-[10px] font-semibold tracking-[0.08em] uppercase"
						>
							{item.group}
						</p>
					{/if}
					<a
						href={item.href}
						onclick={(event) => {
							event.preventDefault();
							activate(item);
						}}
						onmouseenter={() => (index = i)}
						class={[
							'text-foreground flex items-center gap-[11px] rounded-lg border-l-2 px-2.5 py-[9px]',
							index === i ? 'bg-bg-subtle border-l-primary' : 'border-l-transparent'
						]}
					>
						<svg
							width="13"
							height="13"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="text-fg-faint shrink-0"
							aria-hidden="true"
						>
							<path d="m18 16 4-4-4-4M6 8l-4 4 4 4M14.5 4l-5 16" />
						</svg>
						<span class="shrink-0 text-sm font-medium">
							{parts.pre}{#if parts.mid}<mark
									class="bg-accent-soft text-primary rounded-[2px] px-px">{parts.mid}</mark
								>{/if}{parts.post}
						</span>
						<span class="text-muted-foreground min-w-0 flex-1 truncate font-mono text-xs">
							{item.summary ?? ''}
						</span>
						<span class="text-fg-faint shrink-0 text-xs">{item.meta ?? ''}</span>
					</a>
				{/each}
			</div>

			<div
				class="border-border bg-bg-subtle text-muted-foreground flex items-center gap-3.5 border-t px-4 py-2 text-xs"
			>
				<span
					><span class="border-border bg-kbd rounded border px-1 font-mono text-[10px]">↑↓</span> navigate</span
				>
				<span
					><span class="border-border bg-kbd rounded border px-1 font-mono text-[10px]">↵</span> open</span
				>
				<span class="hidden sm:inline"
					><span class="border-border bg-kbd rounded border px-1 font-mono text-[10px]">/</span> focus
					search</span
				>
				<span class="ml-auto">{countLabel}</span>
			</div>
		</div>
	</div>
{/if}
