<script lang="ts">
	import { Button } from '$ixirjs/ui/components/button';
	import { Badge } from '$ixirjs/ui/components/badge';
	import { Input } from '$ixirjs/ui/components/input';
	import { components } from '$docs/registry';
	import ComponentPreview from '$docs/component-preview.svelte';
	import PresetScope from '$docs/preset-scope.svelte';
	import { demoPresets } from '$docs/demo-presets';
	import { page } from '$app/state';
	import { createCopier } from '$docs/utils';
	import pkg from '../../package.json';

	const MANAGERS = ['npm', 'pnpm', 'yarn', 'bun'] as const;

	let manager = $state<(typeof MANAGERS)[number]>('npm');
	let presetKey = $state(demoPresets[0]!.key);

	const copier = createCopier();

	const installCmd = $derived(
		manager === 'npm' ? `npm install ${pkg.name}` : `${manager} add ${pkg.name}`
	);
	const activePreset = $derived(demoPresets.find((p) => p.key === presetKey) ?? demoPresets[0]!);

	// ── Three primitives ────────────────────────────────────────────────────
	const layers = [
		{
			name: 'Atom',
			num: '01',
			sig: 'atom(props)',
			desc: 'Wires attrs, handlers, lifecycle and relationships onto one DOM node.',
			href: '/docs/bonds'
		},
		{
			name: 'Bond',
			num: '02',
			sig: 'DialogBond',
			desc: 'Shared reactive state between the parts of a compound component. No prop drilling.',
			href: '/docs/bonds'
		},
		{
			name: 'Preset',
			num: '03',
			sig: 'setPreset({…})',
			desc: 'Every class name, in one object, overridable globally or per instance.',
			href: '/docs/preset'
		}
	];

	// ── Gallery ─────────────────────────────────────────────────────────────
	// Slugs only; label, category and status come from the registry, so a renamed page cannot leave
	// a stale caption behind.
	const GALLERY_SLUGS = [
		'button',
		'input',
		'slider',
		'checkbox',
		'select',
		'tabs',
		'dialog',
		'popover',
		'toast',
		'accordion',
		'combobox',
		'progress',
		'radio',
		'stepper',
		'tree',
		'drawer',
		'dropdown-menu',
		'swatch',
		'tooltip',
		'card'
	];

	const bySlug = new Map(components.map((entry) => [entry.slug, entry]));
	const gallery = GALLERY_SLUGS.map((slug) => bySlug.get(slug)).filter(
		(entry): entry is NonNullable<typeof entry> => Boolean(entry)
	);

	// ── Agent surfaces ──────────────────────────────────────────────────────
	let agentTab = $state('llms');

	// Built from the live origin, not a literal: this panel's copy button hands someone a real MCP
	// config, and a hardcoded domain would hand them a broken one.
	const agentSurfaces = $derived([
		{
			key: 'llms',
			label: 'llms.txt',
			meta: 'GET /docs/llms.txt · 200 · text/plain',
			note: 'Regenerated on every deploy',
			text: `# ${pkg.name}

> Headless Svelte primitives with a preset-driven class layer.

## Docs
- [Quick start](/docs/quick-start): install, preset, first component
- [Presets](/docs/preset): where the class names live
- [Bonds](/docs/bonds): shared state between the parts
- [Components](/docs/components): all ${components.length}, by category`
		},
		{
			key: 'md',
			label: 'dialog.md',
			meta: 'GET /docs/components/dialog/llms.txt · 200 · text/markdown',
			note: 'Add /llms.txt to any page URL',
			text: `# Dialog

Modal dialog for important user interactions that captures focus.

## Props
- \`open\`: boolean
- \`onopenchange\`: StateChangeCallback<boolean>
- \`type\`: "modal" | "non-modal"
- \`portal\`: string | PortalBond`
		},
		{
			key: 'mcp',
			label: 'mcp.json',
			meta: 'http · list-docs, get-doc, get-component-info',
			note: 'Claude Code, Cursor, Zed',
			text: `{
  "mcpServers": {
    "ixir-ui": {
      "url": "${page.url.origin}/api/mcp"
    }
  }
}`
		}
	]);

	const surface = $derived(agentSurfaces.find((s) => s.key === agentTab) ?? agentSurfaces[0]!);
	const surfaceLines = $derived(surface.text.split('\n'));

	const agentFacts = [
		{ k: 'llms.txt', v: 'one curated index of every page, as Markdown links' },
		{ k: '1 fetch', v: 'no JS, no auth, no rate limit on any surface' },
		{ k: '3 tools', v: 'list docs, fetch a page, look up a component over MCP' }
	];

	const PM_TAB =
		'cursor-pointer rounded-md border-0 bg-transparent px-2.5 py-1 font-mono text-xs transition-colors';
</script>

<svelte:head>
	<title>IXIR UI — Headless Svelte 5 primitives</title>
	<meta
		name="description"
		content="{components.length} accessible Svelte 5 components built on three primitives — Atoms wire the DOM, Bonds share state between parts, Presets hold every class name. Nothing ships styled."
	/>
</svelte:head>

<!-- ═══ Hero ══════════════════════════════════════════════════════════════ -->
<section class="border-border border-b">
	<div
		class="mx-auto grid max-w-[1280px] grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] items-start gap-14 px-5 pt-16 pb-14 max-[1180px]:grid-cols-[minmax(0,1fr)]"
	>
		<div>
			<p class="text-muted-foreground m-0 mb-[18px] font-mono text-xs">
				{pkg.name} · Svelte 5 · MIT
			</p>
			<h1
				class="font-display m-0 mb-[18px] text-[clamp(36px,4.4vw,52px)] leading-[1.06] font-bold tracking-[-0.025em] text-balance"
			>
				Headless primitives.<br />You supply the CSS.
			</h1>
			<p class="text-muted-foreground m-0 mb-7 max-w-[460px] text-[17px] leading-[1.6]">
				{components.length} accessible components built on three primitives — Atoms wire the DOM, Bonds
				share state between parts, Presets hold every class name. Nothing ships styled.
			</p>

			<div class="flex max-w-[460px] flex-col gap-3.5">
				<div class="border-border bg-surface flex w-fit gap-0.5 rounded-lg border p-[3px]">
					{#each MANAGERS as name (name)}
						<button
							type="button"
							onclick={() => (manager = name)}
							aria-pressed={manager === name}
							class={[
								PM_TAB,
								manager === name
									? 'bg-surface-2 text-foreground'
									: 'text-muted-foreground hover:text-foreground'
							]}>{name}</button
						>
					{/each}
				</div>

				<div
					class="border-border bg-code-bg flex items-center gap-2.5 rounded-lg border px-3.5 py-3"
				>
					<span class="text-primary font-mono text-[13px]" aria-hidden="true">$</span>
					<code class="text-code-fg min-w-0 flex-1 overflow-x-auto font-mono text-[13px]"
						>{installCmd}</code
					>
					<button
						type="button"
						onclick={() => copier.run(installCmd, 'install')}
						class="border-border bg-surface text-muted-foreground hover:text-foreground shrink-0 cursor-pointer rounded-md border px-2 py-[3px] text-[11px] transition-colors"
						>{copier.label('install')}</button
					>
				</div>

				<div class="flex flex-wrap gap-2.5">
					<a
						href="/docs/quick-start"
						class="bg-primary text-primary-foreground inline-flex h-10 items-center gap-[7px] rounded-[7px] px-4 text-sm font-medium transition-opacity hover:opacity-90"
					>
						Quick start
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							aria-hidden="true"
						>
							<path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
						</svg>
					</a>
					<a
						href="/docs/components"
						class="border-border hover:border-border-strong text-foreground inline-flex h-10 items-center rounded-[7px] border px-4 text-sm font-medium transition-colors"
						>Browse {components.length} components</a
					>
				</div>
			</div>
		</div>

		<!-- Same components, three presets — the switcher remounts the scope so the new preset takes. -->
		<div class="flex flex-col gap-[30px]">
			<div class="flex items-center gap-5">
				{#each demoPresets as option (option.key)}
					<button
						type="button"
						onclick={() => (presetKey = option.key)}
						aria-pressed={presetKey === option.key}
						class={[
							'cursor-pointer border-0 bg-transparent p-0 text-xs font-medium transition-colors',
							presetKey === option.key
								? 'text-foreground'
								: 'text-fg-faint hover:text-muted-foreground'
						]}>{option.label}</button
					>
				{/each}
			</div>

			{#key presetKey}
				<PresetScope preset={activePreset.preset}>
					<div class="flex flex-col items-stretch gap-5">
						<div class="flex flex-wrap items-center gap-2.5">
							<Button size="sm">Save changes</Button>
							<Button variant="outline" size="sm">Cancel</Button>
							<Badge variant="primary">stable</Badge>
						</div>
						<div class="flex flex-col gap-1.5">
							<span class="text-muted-foreground text-xs">Workspace name</span>
							<Input.Root>
								<Input.TextControl value="atoms-demo" />
							</Input.Root>
						</div>
					</div>
				</PresetScope>
			{/key}

			<div class="relative">
				<button
					type="button"
					onclick={() => copier.run(activePreset.code, 'preset')}
					class="text-fg-faint hover:text-foreground absolute top-0 right-0 cursor-pointer border-0 bg-transparent px-1 py-0.5 text-[11px] transition-colors"
					>{copier.label('preset')}</button
				>
				<pre
					class="text-code-fg m-0 overflow-x-auto font-mono text-xs leading-[1.75]">{activePreset.code}</pre>
			</div>
		</div>
	</div>
</section>

<!-- ═══ Three primitives ══════════════════════════════════════════════════ -->
<section class="border-border border-b">
	<div class="mx-auto max-w-[1280px] px-5 py-14">
		<h2 class="font-display m-0 mb-1.5 text-2xl font-bold tracking-[-0.02em]">Three primitives</h2>
		<p class="text-muted-foreground m-0 mb-7 max-w-[600px] text-[15px] leading-[1.6]">
			Learn these once and every component in the library becomes predictable.
		</p>
		<div
			class="bg-border border-border grid grid-cols-3 gap-px overflow-hidden rounded-[10px] border max-[900px]:grid-cols-1"
		>
			{#each layers as layer (layer.name)}
				<a
					href={layer.href}
					class="bg-surface hover:bg-bg-subtle text-foreground flex flex-col gap-2 p-[22px] transition-colors"
				>
					<div class="flex items-baseline justify-between">
						<span class="font-display text-base font-semibold">{layer.name}</span>
						<span class="text-fg-faint font-mono text-[11px]">{layer.num}</span>
					</div>
					<code class="text-primary font-mono text-xs">{layer.sig}</code>
					<p class="text-muted-foreground m-0 text-[13px] leading-[1.6]">{layer.desc}</p>
				</a>
			{/each}
		</div>
	</div>
</section>

<!-- ═══ Components ════════════════════════════════════════════════════════ -->
<section class="border-border border-b">
	<div class="mx-auto max-w-[1280px] px-5 py-14">
		<div class="mb-6 flex flex-wrap items-baseline justify-between gap-4">
			<div>
				<h2 class="font-display m-0 mb-1.5 text-2xl font-bold tracking-[-0.02em]">Components</h2>
				<p class="text-muted-foreground m-0 text-[15px]">
					Real components, not screenshots. Everything below responds — and follows whichever preset
					is active.
				</p>
			</div>
			<a href="/docs/components" class="text-primary text-sm font-medium"
				>All {components.length} →</a
			>
		</div>

		<div class="grid grid-cols-4 gap-3 max-[1180px]:grid-cols-3 max-[760px]:grid-cols-2">
			{#each gallery as entry (entry.slug)}
				<div
					class="group border-border hover:border-border-strong bg-surface flex flex-col overflow-hidden rounded-[10px] border transition-colors"
				>
					<div class="border-border flex items-center gap-2 border-b px-2.5 py-2">
						<a
							href={entry.href}
							class="text-foreground hover:text-primary text-[12.5px] font-medium transition-colors"
							>{entry.title}</a
						>
						<span
							class={[
								'font-mono text-[10px]',
								entry.status === 'beta' ? 'text-warn' : 'text-fg-faint'
							]}>{entry.status === 'beta' ? 'beta' : entry.category}</span
						>
						<button
							type="button"
							onclick={() => copier.run(entry.importCode, entry.slug)}
							class="border-border bg-bg-subtle text-muted-foreground hover:text-foreground ml-auto cursor-pointer rounded-[5px] border px-[7px] py-0.5 text-[10px] opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
							>{copier.label(entry.slug)}</button
						>
					</div>
					<div
						class="bg-bg-subtle flex min-h-[108px] flex-1 items-center justify-center px-3.5 py-[18px]"
					>
						<ComponentPreview name={entry.slug} />
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ═══ Agent surface ═════════════════════════════════════════════════════ -->
<section class="border-border bg-bg-subtle border-b">
	<div class="mx-auto max-w-[1280px] px-5 py-12">
		<div
			class="grid grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] items-start gap-14 max-[900px]:grid-cols-[minmax(0,1fr)]"
		>
			<div class="flex flex-col gap-[18px] pt-1.5">
				<span
					class="border-accent-line text-primary self-start rounded-full border px-2.5 py-[3px] font-mono text-[10.5px] tracking-[0.06em] uppercase"
					>Agent surface</span
				>
				<div>
					<h2
						class="font-display m-0 mb-2.5 text-[26px] leading-[1.2] font-bold tracking-[-0.025em]"
					>
						Built for the second reader
					</h2>
					<p class="text-muted-foreground m-0 text-[15px] leading-[1.65] text-pretty">
						A growing share of documentation traffic is a coding agent, not a browser. Every page
						here is served as clean Markdown, indexed in
						<code class="text-primary font-mono text-[13px]">llms.txt</code>, and queryable live
						over MCP — the same content, without the chrome.
					</p>
				</div>
				<div class="border-border flex flex-col gap-[9px] border-t pt-4">
					{#each agentFacts as fact (fact.k)}
						<div class="flex items-baseline gap-2.5">
							<span class="text-primary w-[68px] shrink-0 font-mono text-xs">{fact.k}</span>
							<span class="text-muted-foreground min-w-0 text-[13px]">{fact.v}</span>
						</div>
					{/each}
				</div>
			</div>

			<div class="border-border bg-surface overflow-hidden rounded-xl border">
				<div class="border-border bg-bg-subtle flex items-center gap-1 border-b px-2">
					{#each agentSurfaces as tab (tab.key)}
						<button
							type="button"
							onclick={() => (agentTab = tab.key)}
							aria-pressed={agentTab === tab.key}
							class={[
								'-mb-px cursor-pointer border-0 border-b-2 bg-transparent px-2.5 py-[11px] font-mono text-xs transition-colors',
								agentTab === tab.key
									? 'border-b-primary text-foreground'
									: 'text-muted-foreground hover:text-foreground border-b-transparent'
							]}>{tab.label}</button
						>
					{/each}
					<button
						type="button"
						onclick={() => copier.run(surface.text, `surface-${surface.key}`)}
						class="border-border bg-surface text-muted-foreground hover:text-foreground ml-auto cursor-pointer rounded-md border px-2.5 py-1 text-[11px] transition-colors"
						>{copier.label(`surface-${surface.key}`)}</button
					>
				</div>

				<div class="min-h-[196px] px-4 py-4">
					{#each surfaceLines as line, i (i)}
						<div class="flex gap-3.5 font-mono text-[12.5px] leading-[1.85]">
							<span class="text-fg-faint w-3.5 shrink-0 text-right text-[11px]">{i + 1}</span>
							<span
								class={[
									'min-w-0 whitespace-pre-wrap',
									line.startsWith('#')
										? 'text-primary'
										: line.startsWith('>')
											? 'text-muted-foreground italic'
											: line.startsWith('- ')
												? 'text-muted-foreground'
												: 'text-foreground'
								]}>{line === '' ? ' ' : line}</span
							>
						</div>
					{/each}
				</div>

				<div class="border-border bg-bg-subtle flex items-center gap-2.5 border-t px-4 py-2.5">
					<span class="bg-primary h-[7px] w-[7px] shrink-0 rounded-full" aria-hidden="true"></span>
					<span class="text-muted-foreground min-w-0 flex-1 truncate font-mono text-[11px]"
						>{surface.meta}</span
					>
					<span class="text-muted-foreground shrink-0 text-[11.5px]">{surface.note}</span>
				</div>
			</div>
		</div>
	</div>
</section>
