<script lang="ts">
	import { Section, CodeBlock } from '$docs/components';
	import { Button } from '$lib/components/button';

	const bondCode =
		`<script>
  import { Accordion, AccordionItem } from '@svelte-atoms/core';

  // Surface the Bond's shared value through a bindable prop
  let activeItem = $state('getting-started');
<` +
		`/script>

<!-- The Accordion creates its Bond internally and shares it via Svelte context.
     AccordionItem children read the shared state automatically — zero prop drilling. -->
<Accordion bind:value={activeItem} collapsible>
  <AccordionItem.Root value="getting-started">
    <AccordionItem.Header>
      Getting Started
      <AccordionItem.Indicator />
    </AccordionItem.Header>
    <AccordionItem.Body>Install with: npm install @svelte-atoms/core</AccordionItem.Body>
  </AccordionItem.Root>

  <AccordionItem.Root value="configuration">
    <AccordionItem.Header>
      Configuration
      <AccordionItem.Indicator />
    </AccordionItem.Header>
    <AccordionItem.Body>Import styles in your root layout.</AccordionItem.Body>
  </AccordionItem.Root>
</Accordion>`;
</script>

<svelte:head>
	<title>Philosophy — Svelte Atoms</title>
	<meta
		name="description"
		content="The principles and architecture behind Svelte Atoms — Atom, Bond, and Preset — and why they lead to a better component development experience."
	/>
</svelte:head>

<!-- Hero -->
<div class="border-border/60 mb-14 border-b pb-12">
	<p class="text-primary mb-3 text-sm font-medium uppercase tracking-wide">Philosophy</p>
	<h1 class="text-foreground mb-4 text-4xl font-bold tracking-tight">Build less. Control more.</h1>
	<p class="text-muted-foreground mb-8 max-w-xl text-lg leading-relaxed">
		Svelte Atoms is built on one idea: components should be headless by nature, composable by
		design, and owned entirely by the developer who uses them.
	</p>
	<div class="flex flex-wrap gap-3">
		<Button href="/docs/atoms" as="a" variant="primary" class="gap-2 px-5">
			Understand Atoms
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
			</svg>
		</Button>
		<Button href="/docs/bonds" as="a" variant="outline" class="px-5">Understand Bonds</Button>
	</div>
</div>

<!-- The Three Primitives -->
<Section.Root>
	<Section.Header>
		<Section.Title>Three composable primitives</Section.Title>
		<Section.Subtitle>
			Every component in the library is an expression of the same small model.
		</Section.Subtitle>
	</Section.Header>
	<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-8">
		<!-- Atom -->
		<div class="border-border rounded-lg border p-5 bg-card">
			<div
				class="bg-primary/10 text-primary mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<circle cx="12" cy="12" r="1" /><circle cx="12" cy="12" r="7" /><circle
						cx="12"
						cy="12"
						r="11"
					/>
				</svg>
			</div>
			<p class="text-foreground mb-1 text-sm font-semibold">01 — Atom</p>
			<p class="text-muted-foreground text-sm leading-relaxed">
				A composable rendered part backed by an Atom for spreads, element refs, and local
				capabilities. Zero hardcoded styles — infinite flexibility.
			</p>
		</div>
		<!-- Bond -->
		<div class="border-border rounded-lg border p-5 bg-card">
			<div
				class="bg-primary/10 text-primary mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
					<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
				</svg>
			</div>
			<p class="text-foreground mb-1 text-sm font-semibold">02 — Bond</p>
			<p class="text-muted-foreground text-sm leading-relaxed">
				Self-contained reactive state shared through Svelte context. No prop drilling, no global
				stores — state lives exactly where it's needed.
			</p>
		</div>
		<!-- Capability -->
		<div class="border-border rounded-lg border p-5 bg-card">
			<div
				class="bg-primary/10 text-primary mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path
						d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
					/>
					<circle cx="12" cy="12" r="3" />
				</svg>
			</div>
			<p class="text-foreground mb-1 text-sm font-semibold">03 — Capability</p>
			<p class="text-muted-foreground text-sm leading-relaxed">
				Reusable behavior installed on a Bond or Atom. Capabilities handle shared state,
				relationships, effects, and local DOM behavior without repeating code in every component.
			</p>
		</div>
		<!-- Preset -->
		<div class="border-border rounded-lg border p-5 bg-card">
			<div
				class="bg-primary/10 text-primary mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path
						d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
					/>
					<circle cx="12" cy="12" r="3" />
				</svg>
			</div>
			<p class="text-foreground mb-1 text-sm font-semibold">04 — Preset</p>
			<p class="text-muted-foreground text-sm leading-relaxed">
				One <code class="font-mono text-xs">setPreset()</code> call defines your entire design system.
				Override globally or per-instance without specificity battles.
			</p>
		</div>
	</div>
</Section.Root>

<!-- Bond Architecture -->
<Section.Root>
	<Section.Header>
		<Section.Title>The Bond pattern</Section.Title>
		<Section.Subtitle>
			Bonds are how Svelte Atoms moves state between components without coupling them.
		</Section.Subtitle>
	</Section.Header>

	<p class="text-muted-foreground mb-5 text-sm leading-relaxed">
		A Bond is a class that holds the shared state and behavior of a compound component. The root
		component creates its Bond, calls <code class="font-mono text-xs">.share()</code> to place it in
		Svelte context, and every descendant retrieves it automatically via
		<code class="font-mono text-xs">getContext</code> — no props passed between them.
	</p>

	<div class="overflow-hidden rounded-lg mb-6">
		<CodeBlock lang="svelte" code={bondCode} />
	</div>

	<div class="grid gap-3 sm:grid-cols-3">
		<div class="border-border rounded-lg border p-4">
			<p class="text-foreground mb-1 text-sm font-semibold">Encapsulation</p>
			<p class="text-muted-foreground text-xs leading-relaxed">
				State is local to the component tree that needs it — no accidental global leakage.
			</p>
		</div>
		<div class="border-border rounded-lg border p-4">
			<p class="text-foreground mb-1 text-sm font-semibold">Context-driven</p>
			<p class="text-muted-foreground text-xs leading-relaxed">
				The root puts the Bond into Svelte context; any descendant retrieves it automatically — no
				matter how deep in the tree.
			</p>
		</div>
		<div class="border-border rounded-lg border p-4">
			<p class="text-foreground mb-1 text-sm font-semibold">Type safety</p>
			<p class="text-muted-foreground text-xs leading-relaxed">
				Full TypeScript inference — your IDE knows every method and property at authoring time.
			</p>
		</div>
	</div>
</Section.Root>

<!-- Why Svelte 5 Runes -->
<Section.Root>
	<Section.Header>
		<Section.Title>Built for Svelte 5 Runes</Section.Title>
		<Section.Subtitle>
			Runes make Bonds possible. The library embraces them rather than working around them.
		</Section.Subtitle>
	</Section.Header>

	<div class="space-y-3">
		<div class="border-border flex items-start gap-4 rounded-lg border p-4">
			<code
				class="bg-primary/10 text-primary shrink-0 rounded-md px-2 py-1 font-mono text-sm font-semibold"
				>$state</code
			>
			<div>
				<p class="text-foreground mb-0.5 text-sm font-semibold">Fine-grained reactivity</p>
				<p class="text-muted-foreground text-sm leading-relaxed">
					Reactive state that works outside components — not just inside them. This is what makes
					Bonds a standalone primitive rather than a framework hack.
				</p>
			</div>
		</div>

		<div class="border-border flex items-start gap-4 rounded-lg border p-4">
			<code
				class="bg-primary/10 text-primary shrink-0 rounded-md px-2 py-1 font-mono text-sm font-semibold"
				>$derived</code
			>
			<div>
				<p class="text-foreground mb-0.5 text-sm font-semibold">Automatic computation</p>
				<p class="text-muted-foreground text-sm leading-relaxed">
					Computed values that update when their dependencies change — no manual tracking, no stale
					closures, no subscription cleanup.
				</p>
			</div>
		</div>

		<div class="border-border flex items-start gap-4 rounded-lg border p-4">
			<code
				class="bg-primary/10 text-primary shrink-0 rounded-md px-2 py-1 font-mono text-sm font-semibold"
				>$effect</code
			>
			<div>
				<p class="text-foreground mb-0.5 text-sm font-semibold">Declarative side effects</p>
				<p class="text-muted-foreground text-sm leading-relaxed">
					Side effects that re-run when dependencies change. Used for DOM sync, focus management,
					and external state — never for derived data.
				</p>
			</div>
		</div>
	</div>
</Section.Root>

<!-- Design Goals -->
<Section.Root>
	<Section.Header>
		<Section.Title>What we optimize for</Section.Title>
		<Section.Subtitle>The four qualities we measure every decision against.</Section.Subtitle>
	</Section.Header>

	<div class="grid gap-3 sm:grid-cols-2 mb-8">
		<div class="border-border flex items-start gap-3 rounded-lg border p-4">
			<div
				class="bg-primary/10 text-primary mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="15"
					height="15"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
				</svg>
			</div>
			<div>
				<p class="text-foreground mb-0.5 text-sm font-semibold">Developer experience</p>
				<p class="text-muted-foreground text-xs leading-relaxed">
					Clear APIs, full TypeScript inference, and documentation that answers before you have to
					ask.
				</p>
			</div>
		</div>
		<div class="border-border flex items-start gap-3 rounded-lg border p-4">
			<div
				class="bg-primary/10 text-primary mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="15"
					height="15"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
				</svg>
			</div>
			<div>
				<p class="text-foreground mb-0.5 text-sm font-semibold">Performance</p>
				<p class="text-muted-foreground text-xs leading-relaxed">
					Minimal bundle footprint. Svelte's compiler does the heavy lifting — we don't add runtime
					overhead on top.
				</p>
			</div>
		</div>
		<div class="border-border flex items-start gap-3 rounded-lg border p-4">
			<div
				class="bg-primary/10 text-primary mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="15"
					height="15"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<circle cx="12" cy="8" r="5" /><path d="M3 21v-7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v7" />
				</svg>
			</div>
			<div>
				<p class="text-foreground mb-0.5 text-sm font-semibold">User experience</p>
				<p class="text-muted-foreground text-xs leading-relaxed">
					Smooth interactions, proper focus management, and accessible behavior out of the box — not
					bolted on.
				</p>
			</div>
		</div>
		<div class="border-border flex items-start gap-3 rounded-lg border p-4">
			<div
				class="bg-primary/10 text-primary mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="15"
					height="15"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path
						d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
					/>
				</svg>
			</div>
			<div>
				<p class="text-foreground mb-0.5 text-sm font-semibold">Extensibility</p>
				<p class="text-muted-foreground text-xs leading-relaxed">
					Fork a component, override a bond, bypass the preset. We give you the floor, not the
					ceiling.
				</p>
			</div>
		</div>
	</div>
</Section.Root>

<!-- What We're Not -->
<Section.Root class="mb-0">
	<Section.Header>
		<Section.Title>What we're not</Section.Title>
		<Section.Subtitle>Setting the right expectations from the start.</Section.Subtitle>
	</Section.Header>
	<div class="border-border divide-border overflow-hidden rounded-lg border divide-y">
		<div class="flex items-start gap-3 px-5 py-4">
			<span
				class="text-muted-foreground/50 mt-0.5 shrink-0 text-base font-light leading-none select-none"
				>×</span
			>
			<div>
				<p class="text-foreground mb-0.5 text-sm font-semibold">Not a CSS framework</p>
				<p class="text-muted-foreground text-sm leading-relaxed">
					Tailwind is the default but not a constraint. Bring your own styling if you prefer CSS
					modules, plain CSS, or something else.
				</p>
			</div>
		</div>
		<div class="flex items-start gap-3 px-5 py-4">
			<span
				class="text-muted-foreground/50 mt-0.5 shrink-0 text-base font-light leading-none select-none"
				>×</span
			>
			<div>
				<p class="text-foreground mb-0.5 text-sm font-semibold">Not a global state manager</p>
				<p class="text-muted-foreground text-sm leading-relaxed">
					Bonds handle component-level state. For app-wide state — server data, auth, routing — use
					whatever fits your stack.
				</p>
			</div>
		</div>
		<div class="flex items-start gap-3 px-5 py-4">
			<span
				class="text-muted-foreground/50 mt-0.5 shrink-0 text-base font-light leading-none select-none"
				>×</span
			>
			<div>
				<p class="text-foreground mb-0.5 text-sm font-semibold">Not a finished design system</p>
				<p class="text-muted-foreground text-sm leading-relaxed">
					The Preset system is the foundation. The design language — colors, spacing, motion — is
					entirely yours to define.
				</p>
			</div>
		</div>
	</div>
</Section.Root>
