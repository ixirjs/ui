<script lang="ts">
	import { Button } from '$svelte-atoms/core/components/button';
	import { Input } from '$svelte-atoms/core/components/input';
	import { Badge } from '$svelte-atoms/core/components/badge';
	import { Alert } from '$svelte-atoms/core/components/alert';
	import { Tabs, Tab } from '$svelte-atoms/core/components/tabs';
	import { Select } from '$svelte-atoms/core/components/select';
	import { DropdownMenu } from '$svelte-atoms/core/components/dropdown-menu';
	import { animateSidebarContent, Sidebar } from '$svelte-atoms/core/components/sidebar';
	import { goto } from '$app/navigation';
	import TooltipDemo from './demos/tooltip-demo.svelte';
	import PopoverDemo from './demos/popover-demo.svelte';
	import DialogDemo from './demos/dialog-demo.svelte';
	import DrawerDemo from './demos/drawer-demo.svelte';

	let tabValue = $state('account');
	let selectOpen = $state(false);
	let dropdownMenuOpen = $state(false);
	let sidebarOpen = $state(false);
	let copied = $state(false);
	let activeStep = $state(0);

	const fruits = $state(['apple', 'banana', 'cherry']);
	let packageManager = $state<'npm' | 'pnpm' | 'yarn' | 'bun'>('bun');

	const installCommands = {
		npm: 'npm install @svelte-atoms/core',
		pnpm: 'pnpm add @svelte-atoms/core',
		yarn: 'yarn add @svelte-atoms/core',
		bun: 'bun add @svelte-atoms/core'
	};

	function copyCode() {
		const snippets = [
			installCommands[packageManager] as string,
			`import '@svelte-atoms/core/root.css';`,
			`import { setPreset } from '@svelte-atoms/core';\n\nsetPreset({\n  button: () => ({\n    class: 'px-4 py-2 rounded-lg',\n    variants: { ... }\n  })\n});`,
			`import { Button } from '@svelte-atoms/core/components/button';`
		];
		navigator.clipboard.writeText(snippets[activeStep] ?? '');
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	function getAlertLayoutStyle() {
		return "grid-template-areas: 'icon title close-button' '. description description' 'content content content' 'actions actions actions'; grid-template-columns: auto 1fr auto;";
	}
</script>

<svelte:head>
	<title>Svelte Atoms — Headless UI for Svelte 5</title>
	<meta
		name="description"
		content="A modern, headless, fully composable Svelte 5 UI component library. Build your design system with the Bond architecture and Preset system."
	/>
</svelte:head>

<!-- ============================================================
     HERO
     ============================================================ -->
<section class="border-border/50 border-b">
	<div class="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8">
		<!-- Label -->
		<div class="mb-6 flex items-center gap-2">
			<Badge class="border-primary/20 bg-primary/5 text-primary gap-1.5 text-xs font-medium">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="10"
					height="10"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
				</svg>
				Svelte 5 · Runes · TypeScript
			</Badge>
		</div>

		<!-- Headline -->
		<h1
			class="from-foreground to-foreground/50 mb-6 bg-gradient-to-br bg-clip-text text-5xl leading-[1.1] font-bold tracking-tight text-transparent sm:text-6xl lg:text-7xl"
		>
			Your design system,<br />
			<span class="text-primary">your rules.</span>
		</h1>

		<!-- Sub -->
		<p class="text-muted-foreground mb-10 max-w-xl text-lg leading-relaxed">
			A headless Svelte 5 component library. No hardcoded styles. You own every pixel via the
			<strong class="text-foreground font-medium">Preset system</strong> — globally configurable, locally
			overridable.
		</p>

		<!-- CTAs -->
		<div class="flex flex-wrap gap-3">
			<Button variant="primary" class="gap-2 px-5" onclick={() => goto('/docs/quick-start')}>
				Get started
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
				>
					<path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
				</svg>
			</Button>
			<Button variant="outline" class="gap-2 px-5" onclick={() => goto('/docs')}>
				Browse components
			</Button>
			<Button
				variant="ghost"
				class="gap-2 px-5"
				onclick={() => window.open('https://github.com/svelte-atoms/core', '_blank')}
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
				>
					<path
						d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
					/>
					<path d="M9 18c-4.51 2-5-2-7-2" />
				</svg>
				GitHub
			</Button>
		</div>

		<!-- Metrics -->
		<div class="border-border mt-12 border-t pt-8">
			<div class="flex flex-wrap gap-y-6 gap-x-8 md:gap-0 md:divide-x md:divide-border">
				{#each [{ value: '30+', label: 'Components' }, { value: '0px', label: 'Hardcoded styles' }, { value: '100%', label: 'TypeScript typed' }, { value: 'WAI‑ARIA', label: 'Accessible by default' }] as stat (stat.value)}
					<div class="flex flex-col gap-0 md:px-8 md:first:pl-0 md:last:pr-0">
						<span class="text-primary text-lg font-medium tracking-tight leading-none"
							>{stat.value}</span
						>
						<span class="text-muted-foreground mt-1.5 text-xs uppercase tracking-wide"
							>{stat.label}</span
						>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<!-- ============================================================
     HOW IT WORKS — Architecture
     ============================================================ -->
<section class="border-border/50 border-b">
	<div class="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
		<div class="mb-12">
			<p class="text-primary mb-2 text-sm font-medium tracking-wide uppercase">Architecture</p>
			<h2 class="mb-3 text-3xl font-bold">Three layers. Total control.</h2>
			<p class="text-muted-foreground max-w-2xl">
				Svelte Atoms is built around three composable primitives that work together to give you
				complete control over behaviour, state, and style — without coupling them together.
			</p>
		</div>

		<div class="grid gap-px border md:grid-cols-3 bg-border border-border">
			<!-- Atoms -->
			<div class="bg-card p-8">
				<div class="mb-5 flex items-center justify-between">
					<div
						class="bg-primary/10 text-primary inline-flex h-10 w-10 items-center justify-center rounded-lg"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<circle cx="12" cy="12" r="1" /><circle cx="12" cy="12" r="7" /><circle
								cx="12"
								cy="12"
								r="11"
							/>
						</svg>
					</div>
					<span class="text-muted-foreground/50 font-mono text-xs">01</span>
				</div>
				<h3 class="mb-2 text-base font-semibold">Atoms</h3>
				<p class="text-muted-foreground text-sm leading-relaxed">
					The lowest-level building block. <code class="bg-muted rounded px-1 text-xs"
						>HtmlAtom</code
					>
					wraps any HTML element and injects preset classes, variants, and bond state — with zero hardcoded
					styles.
				</p>
				<a
					href="/docs/atoms"
					class="text-primary mt-4 inline-flex items-center gap-1 text-sm font-medium"
				>
					Learn more <svg
						xmlns="http://www.w3.org/2000/svg"
						width="13"
						height="13"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg
					>
				</a>
			</div>

			<!-- Bond -->
			<div class="bg-card p-8">
				<div class="mb-5 flex items-center justify-between">
					<div
						class="bg-primary/10 text-primary inline-flex h-10 w-10 items-center justify-center rounded-lg"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
							<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
						</svg>
					</div>
					<span class="text-muted-foreground/50 font-mono text-xs">02</span>
				</div>
				<h3 class="mb-2 text-base font-semibold">Bond</h3>
				<p class="text-muted-foreground text-sm leading-relaxed">
					Shared reactive state between a component's parts. No prop drilling — child components
					read their parent's bond from Svelte context. State flows down automatically.
				</p>
				<a
					href="/docs/philosophy"
					class="text-primary mt-4 inline-flex items-center gap-1 text-sm font-medium"
				>
					Learn more <svg
						xmlns="http://www.w3.org/2000/svg"
						width="13"
						height="13"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg
					>
				</a>
			</div>

			<!-- Preset -->
			<div class="bg-card p-8">
				<div class="mb-5 flex items-center justify-between">
					<div
						class="bg-primary/10 text-primary inline-flex h-10 w-10 items-center justify-center rounded-lg"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path
								d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
							/>
							<circle cx="12" cy="12" r="3" />
						</svg>
					</div>
					<span class="text-muted-foreground/50 font-mono text-xs">03</span>
				</div>
				<h3 class="mb-2 text-base font-semibold">Preset</h3>
				<p class="text-muted-foreground text-sm leading-relaxed">
					A global style configuration for your entire app. Define variants, defaults, and classes
					per component slot once — override locally per instance. Your design system lives here.
				</p>
				<a
					href="/docs/styling"
					class="text-primary mt-4 inline-flex items-center gap-1 text-sm font-medium"
				>
					Learn more <svg
						xmlns="http://www.w3.org/2000/svg"
						width="13"
						height="13"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg
					>
				</a>
			</div>
		</div>
	</div>
</section>

<!-- ============================================================
     COMPONENT SHOWCASE
     ============================================================ -->
<section class="border-border/50 border-b">
	<div class="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
		<div class="mb-12">
			<p class="text-primary mb-2 text-sm font-medium tracking-wide uppercase">Components</p>
			<h2 class="mb-3 text-3xl font-bold">Everything you need.</h2>
			<p class="text-muted-foreground max-w-2xl">
				30+ accessible components. Each one is headless — style it once in your preset, use it
				everywhere.
			</p>
		</div>

		<div
			class="grid grid-cols-1 gap-px border md:grid-cols-2 lg:grid-cols-3 bg-border"
			style="border-color: var(--color-border);"
		>
			<!-- Button -->
			<div class="bg-card flex flex-col gap-4 p-6">
				<div class="flex items-center justify-between">
					<h3 class="text-sm font-semibold">Button</h3>
					<a href="/docs/components/button" class="text-muted-foreground hover:text-primary text-xs"
						>docs →</a
					>
				</div>
				<div class="flex flex-1 flex-wrap items-center justify-center gap-2">
					<Button variant="primary" class="text-sm">Primary</Button>
					<Button variant="secondary" class="text-sm">Secondary</Button>
					<Button variant="outline" class="text-sm">Outline</Button>
					<Button variant="ghost" class="text-sm">Ghost</Button>
					<Button variant="destructive" class="text-sm">Danger</Button>
				</div>
				<p class="text-muted-foreground text-xs">
					Five semantic variants, fully composable trigger surface
				</p>
			</div>

			<!-- Badge -->
			<div class="bg-card flex flex-col gap-4 p-6">
				<div class="flex items-center justify-between">
					<h3 class="text-sm font-semibold">Badge</h3>
					<a href="/docs/components/badge" class="text-muted-foreground hover:text-primary text-xs"
						>docs →</a
					>
				</div>
				<div class="flex flex-1 flex-wrap items-center justify-center gap-2">
					<Badge variant="primary">Primary</Badge>
					<Badge variant="secondary">Secondary</Badge>
					<Badge variant="outline">Outline</Badge>
					<Badge variant="destructive">Error</Badge>
				</div>
				<p class="text-muted-foreground text-xs">
					Inline labels for status, categories, and metadata
				</p>
			</div>

			<!-- Input -->
			<div class="bg-card flex flex-col gap-4 p-6">
				<div class="flex items-center justify-between">
					<h3 class="text-sm font-semibold">Input</h3>
					<a href="/docs/components/input" class="text-muted-foreground hover:text-primary text-xs"
						>docs →</a
					>
				</div>
				<div class="flex-1 space-y-2">
					<Input.Root class="rounded-md">
						<Input.Control placeholder="Full name" class="px-3 py-2 text-sm" />
					</Input.Root>
					<Input.Root class="rounded-md">
						<Input.Control type="email" placeholder="email@example.com" class="px-3 py-2 text-sm" />
					</Input.Root>
				</div>
				<p class="text-muted-foreground text-xs">
					Composable slots for prefix, suffix, and validation state
				</p>
			</div>

			<!-- Alert -->
			<div class="bg-card flex flex-col gap-4 p-6">
				<div class="flex items-center justify-between">
					<h3 class="text-sm font-semibold">Alert</h3>
					<a href="/docs/components/alert" class="text-muted-foreground hover:text-primary text-xs"
						>docs →</a
					>
				</div>
				<div class="flex-1 space-y-2">
					<Alert.Root variant="info" class="grid items-center" style={getAlertLayoutStyle()}>
						<Alert.Icon>
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								class="h-4 w-4"
							>
								<circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
							</svg>
						</Alert.Icon>
						<Alert.Title class="text-sm font-medium">Heads up</Alert.Title>
						<Alert.Description class="text-xs"
							>Your session expires in 10 minutes.</Alert.Description
						>
					</Alert.Root>
					<Alert.Root variant="success" class="grid items-center" style={getAlertLayoutStyle()}>
						<Alert.Icon>
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								class="h-4 w-4"
							>
								<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" />
							</svg>
						</Alert.Icon>
						<Alert.Title class="text-sm font-medium">Saved</Alert.Title>
						<Alert.Description class="text-xs">Your changes have been saved.</Alert.Description>
					</Alert.Root>
				</div>
				<p class="text-muted-foreground text-xs">
					Four semantic variants — info, success, warning, error
				</p>
			</div>

			<!-- Tabs -->
			<div class="bg-card flex flex-col gap-4 p-6">
				<div class="flex items-center justify-between">
					<h3 class="text-sm font-semibold">Tabs</h3>
					<a href="/docs/components/tabs" class="text-muted-foreground hover:text-primary text-xs"
						>docs →</a
					>
				</div>
				<div class="flex-1">
					<Tabs.Root bind:value={tabValue} onchange={() => {}} class="">
						<Tabs.Header class="border-border border-b text-sm">
							<Tab.Root value="account">
								<Tab.Header>Account</Tab.Header>
								<Tab.Body class="mt-3">
									<p class="text-muted-foreground text-sm">Manage your account settings.</p>
								</Tab.Body>
							</Tab.Root>
							<Tab.Root value="settings">
								<Tab.Header>Settings</Tab.Header>
								<Tab.Body class="mt-3">
									<p class="text-muted-foreground text-sm">Configure your preferences.</p>
								</Tab.Body>
							</Tab.Root>
						</Tabs.Header>
						<Tabs.Body>
							<Tabs.Content />
						</Tabs.Body>
					</Tabs.Root>
				</div>
				<p class="text-muted-foreground text-xs">
					Controlled and uncontrolled modes, keyboard navigable
				</p>
			</div>

			<!-- Select -->
			<div class="bg-card flex flex-col gap-4 p-6">
				<div class="flex items-center justify-between">
					<h3 class="text-sm font-semibold">Select</h3>
					<a href="/docs/components/select" class="text-muted-foreground hover:text-primary text-xs"
						>docs →</a
					>
				</div>
				<div class="flex-1">
					<Select.Root bind:open={selectOpen} keys={fruits} offset={2}>
						<Select.Trigger base={Input.Root} class="w-full h-12">
							<Select.Placeholder>Pick a fruit</Select.Placeholder>
							<Select.Selections />
							<Select.Indicator class="ml-auto" />
						</Select.Trigger>
						<Select.Content>
							{#each fruits as fruit, i (i)}
								<Select.Item value={fruit} class="capitalize">{fruit}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<p class="text-muted-foreground text-xs">
					Single and multi-select with keyboard navigation
				</p>
			</div>

			<!-- Dropdown Menu -->
			<div class="bg-card flex flex-col gap-4 p-6">
				<div class="flex items-center justify-between">
					<h3 class="text-sm font-semibold">Dropdown Menu</h3>
					<a
						href="/docs/components/dropdown-menu"
						class="text-muted-foreground hover:text-primary text-xs">docs →</a
					>
				</div>
				<div class="flex-1">
					<DropdownMenu.Root bind:open={dropdownMenuOpen}>
						<DropdownMenu.Trigger base={Button} variant="outline" class="w-full justify-between">
							Actions
							<DropdownMenu.Indicator class="ml-auto" />
						</DropdownMenu.Trigger>
						<DropdownMenu.Content>
							<DropdownMenu.Item>Edit</DropdownMenu.Item>
							<DropdownMenu.Item>Duplicate</DropdownMenu.Item>
							<DropdownMenu.Item>Archive</DropdownMenu.Item>
							<DropdownMenu.Item>Delete</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
				<p class="text-muted-foreground text-xs">
					Action menu with nested groups and keyboard traversal
				</p>
			</div>

			<!-- Tooltip -->
			<div class="bg-card flex flex-col gap-4 p-6">
				<div class="flex items-center justify-between">
					<h3 class="text-sm font-semibold">Tooltip</h3>
					<a
						href="/docs/components/tooltip"
						class="text-muted-foreground hover:text-primary text-xs">docs →</a
					>
				</div>
				<div class="flex flex-1 items-center">
					<TooltipDemo />
				</div>
				<p class="text-muted-foreground text-xs">Disabled state with contextual explanation</p>
			</div>

			<!-- Popover -->
			<div class="bg-card flex flex-col gap-4 p-6">
				<div class="flex items-center justify-between">
					<h3 class="text-sm font-semibold">Popover</h3>
					<a
						href="/docs/components/popover"
						class="text-muted-foreground hover:text-primary text-xs">docs →</a
					>
				</div>
				<div class="flex flex-1 items-center justify-center">
					<PopoverDemo />
				</div>
				<p class="text-muted-foreground text-xs">Issue label filter — toggle multiple, clear all</p>
			</div>

			<!-- Dialog -->
			<div class="bg-card flex flex-col gap-4 p-6">
				<div class="flex items-center justify-between">
					<h3 class="text-sm font-semibold">Dialog</h3>
					<a href="/docs/components/dialog" class="text-muted-foreground hover:text-primary text-xs"
						>docs →</a
					>
				</div>
				<div class="flex flex-1 items-center">
					<DialogDemo />
				</div>
				<p class="text-muted-foreground text-xs">Destructive confirm with typed phrase unlock</p>
			</div>

			<!-- Drawer -->
			<div class="bg-card flex flex-col gap-4 p-6">
				<div class="flex items-center justify-between">
					<h3 class="text-sm font-semibold">Drawer</h3>
					<a href="/docs/components/drawer" class="text-muted-foreground hover:text-primary text-xs"
						>docs →</a
					>
				</div>
				<div class="flex flex-1 items-center">
					<DrawerDemo />
				</div>
				<p class="text-muted-foreground text-xs">Notification tray — mark read, dismiss per item</p>
			</div>

			<!-- Sidebar -->
			<div class="bg-card flex flex-col gap-4 p-6">
				<div class="flex items-center justify-between">
					<h3 class="text-sm font-semibold">Sidebar</h3>
					<a
						href="/docs/components/sidebar"
						class="text-muted-foreground hover:text-primary text-xs">docs →</a
					>
				</div>
				<div class="bg-muted border-border h-24 overflow-hidden rounded-md border">
					<Sidebar.Root bind:open={sidebarOpen}>
						<div class="flex h-full">
							<Sidebar.Content
								class="bg-card border-border flex min-w-fit flex-col items-center border-r px-2 py-3 text-xs"
								animate={animateSidebarContent({ '0': '48px', '1': '120px' })}
							>
								<span class="text-muted-foreground">{sidebarOpen ? 'Expanded' : 'Nav'}</span>
							</Sidebar.Content>
							<div class="text-muted-foreground flex flex-1 items-center justify-center text-xs">
								Main content
							</div>
						</div>
					</Sidebar.Root>
				</div>
				<Button variant="outline" class="w-full" onclick={() => (sidebarOpen = !sidebarOpen)}>
					Toggle Sidebar
				</Button>
			</div>
		</div>

		<div class="mt-6 text-center">
			<a href="/docs" class="text-primary text-sm font-medium hover:underline">
				View all 30+ components →
			</a>
		</div>
	</div>
</section>

<!-- ============================================================
     INSTALL
     ============================================================ -->
<section class="border-border/50 border-b">
	<div class="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
		<!-- Header -->
		<div class="mb-14 text-center">
			<p class="text-primary mb-2 text-sm font-medium tracking-wide uppercase">Quick start</p>
			<h2 class="mb-3 text-3xl font-bold">Up in minutes.</h2>
			<p class="text-muted-foreground mx-auto max-w-md">
				Install the package, configure your preset, and start composing.
			</p>
		</div>

		<!-- Step tracker -->
		<div class="relative mb-10 flex items-start justify-between px-6">
			<div class="bg-border absolute top-3.5 left-6 right-6 h-px" aria-hidden="true"></div>
			{#each [{ n: 0, title: 'Install' }, { n: 1, title: 'Import styles' }, { n: 2, title: 'Configure' }, { n: 3, title: 'Compose' }] as step (step.n)}
				<button
					onclick={() => (activeStep = step.n)}
					class="group relative flex flex-col items-center gap-2"
				>
					<div
						class="relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 {activeStep ===
						step.n
							? 'bg-primary text-primary-foreground scale-110'
							: activeStep > step.n
								? 'border-primary/30 bg-primary/20 text-primary border'
								: 'bg-background border-border text-muted-foreground border group-hover:border-primary/50 group-hover:text-primary/70'}"
					>
						{#if activeStep > step.n}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="3"
								stroke-linecap="round"
								stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg
							>
						{:else}
							{step.n + 1}
						{/if}
					</div>
					<span
						class="whitespace-nowrap text-xs font-medium transition-colors {activeStep === step.n
							? 'text-foreground'
							: 'text-muted-foreground group-hover:text-foreground/70'}">{step.title}</span
					>
				</button>
			{/each}
		</div>

		<!-- Terminal window -->
		<div class="border-border overflow-hidden rounded-xl border shadow-xl">
			<!-- Window chrome -->
			<div class="bg-muted border-border flex items-center gap-4 border-b px-4 py-2.5">
				<!-- Generic code indicator, not OS-specific -->
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
					class="text-muted-foreground/40 shrink-0"
					><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg
				>

				<div class="flex flex-1 items-center justify-center">
					{#if activeStep === 0}
						<!-- Segmented control -->
						<div class="border-border flex overflow-hidden rounded-md border font-mono text-xs">
							{#each ['npm', 'pnpm', 'yarn', 'bun'] as const as pm (pm)}
								<button
									onclick={() => (packageManager = pm)}
									class="border-border border-r px-3 py-1 font-medium transition-colors last:border-r-0 {packageManager ===
									pm
										? 'bg-foreground text-background'
										: 'text-muted-foreground hover:bg-border/60 hover:text-foreground'}"
								>
									{pm}
								</button>
							{/each}
						</div>
					{:else}
						<span class="text-muted-foreground font-mono text-xs">
							{activeStep === 3 ? '+page.svelte' : '+layout.svelte'}
						</span>
					{/if}
				</div>

				<button
					onclick={copyCode}
					class="text-muted-foreground hover:text-foreground shrink-0 rounded p-1 transition-colors"
					title="Copy"
				>
					{#if copied}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="13"
							height="13"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="text-green-400"><path d="M20 6 9 17l-5-5" /></svg
						>
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="13"
							height="13"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path
								d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
							/></svg
						>
					{/if}
				</button>
			</div>

			<!-- Code area -->
			<div class="min-h-64 bg-[#0d1117] px-6 py-6 font-mono text-sm leading-7">
				{#if activeStep === 0}
					<div class="text-[#8b949e]"># Add to your SvelteKit project</div>
					<div class="mt-4 flex items-center gap-2">
						<span class="select-none text-[#8b949e]">$</span>
						<span class="text-[#e6edf3]">{installCommands[packageManager]}</span>
					</div>
				{:else if activeStep === 1}
					<div class="text-[#8b949e]">{'<!-- src/routes/+layout.svelte -->'}</div>
					<div class="mt-3"><span class="text-[#7ee787]">&lt;script lang="ts"&gt;</span></div>
					<div class="ml-4">
						<span class="text-[#ff7b72]">import</span>
						<span class="text-[#e6edf3]"> </span>
						<span class="text-[#a5d6ff]">'@svelte-atoms/core/root.css'</span>
						<span class="text-[#e6edf3]">;</span>
					</div>
					<div><span class="text-[#7ee787]">&lt;/script&gt;</span></div>
				{:else if activeStep === 2}
					<div class="text-[#8b949e]">{'<!-- src/routes/+layout.svelte -->'}</div>
					<div class="mt-3"><span class="text-[#7ee787]">&lt;script lang="ts"&gt;</span></div>
					<div class="ml-4">
						<span class="text-[#ff7b72]">import</span>
						<span class="text-[#e6edf3]"> {'{ '}</span>
						<span class="text-[#d2a8ff]">setPreset</span>
						<span class="text-[#e6edf3]">{' }'}</span>
						<span class="text-[#ff7b72]"> from </span>
						<span class="text-[#a5d6ff]">'@svelte-atoms/core'</span>
						<span class="text-[#e6edf3]">;</span>
					</div>
					<div class="mt-2 ml-4">
						<span class="text-[#d2a8ff]">setPreset</span>
						<span class="text-[#e6edf3]">{'({'}</span>
					</div>
					<div class="ml-8">
						<span class="text-[#ffa657]">button</span>
						<span class="text-[#e6edf3]">: () =&gt; {'({'}</span>
					</div>
					<div class="ml-12">
						<span class="text-[#ffa657]">class</span>
						<span class="text-[#e6edf3]">: </span>
						<span class="text-[#a5d6ff]">'px-4 py-2 rounded-lg'</span>
						<span class="text-[#e6edf3]">,</span>
					</div>
					<div class="ml-12">
						<span class="text-[#ffa657]">variants</span>
						<span class="text-[#e6edf3]">: {'{ ... }'}</span>
					</div>
					<div class="ml-8"><span class="text-[#e6edf3]">{'})'}</span></div>
					<div class="ml-4"><span class="text-[#e6edf3]">{'}'});</span></div>
					<div><span class="text-[#7ee787]">&lt;/script&gt;</span></div>
				{:else}
					<div class="text-[#8b949e]">{'<!-- src/routes/+page.svelte -->'}</div>
					<div class="mt-3"><span class="text-[#7ee787]">&lt;script lang="ts"&gt;</span></div>
					<div class="ml-4">
						<span class="text-[#ff7b72]">import</span>
						<span class="text-[#e6edf3]"> {'{ '}</span>
						<span class="text-[#d2a8ff]">Button</span>
						<span class="text-[#e6edf3]">{' }'}</span>
						<span class="text-[#ff7b72]"> from </span>
						<span class="text-[#a5d6ff]">'@svelte-atoms/core/components/button'</span>
						<span class="text-[#e6edf3]">;</span>
					</div>
					<div><span class="text-[#7ee787]">&lt;/script&gt;</span></div>
					<div class="mt-3">
						<span class="text-[#7ee787]">{'<Button'}</span>
						<span class="text-[#79c0ff]"> variant</span>
						<span class="text-[#e6edf3]">=</span>
						<span class="text-[#a5d6ff]">"primary"</span>
						<span class="text-[#7ee787]">{'>'}</span>
						<span class="text-[#e6edf3]">Click me</span>
						<span class="text-[#7ee787]">{'</Button>'}</span>
					</div>
				{/if}
			</div>

			<!-- Footer callout -->
			<div class="bg-muted/50 border-border border-t px-6 py-3">
				<p class="text-muted-foreground text-xs">
					{#if activeStep === 0}
						One package. No peer dependencies, no CSS framework required.
					{:else if activeStep === 1}
						Import the base reset once in your root layout — that's all the global CSS you need.
					{:else if activeStep === 2}
						<code class="bg-muted rounded px-1">setPreset()</code> runs once at startup and applies globally.
						Override per component instance as needed.
					{:else}
						Every component is individually importable and tree-shakeable.
					{/if}
				</p>
			</div>
		</div>

		<div class="mt-8 text-center">
			<a
				href="/docs/quick-start"
				class="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
			>
				Full setup guide
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="13"
					height="13"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg
				>
			</a>
		</div>
	</div>
</section>

<!-- ============================================================
     FINAL CTA
     ============================================================ -->
<section class="border-border/50 border-t bg-muted/30">
	<div class="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
		<h2 class="mb-4 text-3xl font-bold">Ready to build?</h2>
		<p class="text-muted-foreground mx-auto mb-8 max-w-md">
			Start with the quick-start guide or explore the component library. Everything is open source.
		</p>
		<div class="flex flex-wrap justify-center gap-3">
			<Button variant="primary" class="gap-2 px-6" onclick={() => goto('/docs/quick-start')}>
				Get started
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
				>
					<path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
				</svg>
			</Button>
			<Button
				variant="outline"
				class="gap-2 px-6"
				onclick={() => window.open('https://github.com/svelte-atoms/core', '_blank')}
			>
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
				>
					<path
						d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
					/>
					<path d="M9 18c-4.51 2-5-2-7-2" />
				</svg>
				Star on GitHub
			</Button>
		</div>
	</div>
</section>
