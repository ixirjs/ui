<script lang="ts">
	import { Input } from '$lib/components/input';
	import {
		DocComponentPage,
		DocSection,
		DocExample,
		DocOnly,
		DocInstallation,
		DocAccessibility,
		DocCode,
		DocCallout,
		DocPropsTabs
	} from '$docs/components';
	import type { PropsSection } from '$docs/components';
	import {
		inputRootProps,
		commonControlProps,
		textControlProps,
		passwordControlProps,
		emailControlProps,
		urlControlProps,
		phoneControlProps,
		numberControlProps,
		currencyControlProps,
		timeControlProps,
		dateControlProps,
		dateTimeControlProps,
		colorControlProps,
		otpControlProps,
		fileControlProps,
		locationControlProps
	} from './props';
	import { metadata } from './shared';
	import type { DocMode } from '$docs/context/doc-mode.svelte';
	import type { Frontmatter } from '$docs/md/frontmatter';
	import { newLine } from '$docs/md/template';
	import { SearchIcon } from 'lucide-svelte';

	let { contentType = 'html' }: { contentType?: DocMode } = $props();

	const frontmatter: Frontmatter = {
		id: 'input',
		title: 'Input',
		category: 'components',
		depth: 'beginner',
		prerequisites: [],
		related: []
	};

	let textValue = $state('');
	let passwordValue = $state('');
	let searchValue = $state('');
	let numberValue = $state(0);
	let currencyValue = $state('');
	let currencyAmount = $state<number | undefined>(undefined);
	let timeValue = $state('');
	let dateValue = $state('');
	let datetimeValue = $state('');
	let emailValue = $state('');
	let urlValue = $state('');
	let phoneValue = $state('');
	let locationValue = $state('');
	let colorValue = $state('oklch(0.65 0.18 253)');
	let otpValue = $state('');
	let fileList = $state<File[]>([]);

	const apiSections: PropsSection[] = [
		{ label: 'Input.Root', presetKey: 'input', props: inputRootProps },
		{ label: 'Common', props: commonControlProps },
		{ label: 'Text', props: textControlProps },
		{ label: 'Password', props: passwordControlProps },
		{ label: 'Number', props: numberControlProps },
		{ label: 'Currency', props: currencyControlProps },
		{ label: 'Time', props: timeControlProps },
		{ label: 'Date', props: dateControlProps },
		{ label: 'DateTime', props: dateTimeControlProps },
		{ label: 'Email', props: emailControlProps },
		{ label: 'Url', props: urlControlProps },
		{ label: 'Phone', props: phoneControlProps },
		{ label: 'Color', props: colorControlProps },
		{ label: 'Otp', props: otpControlProps },
		{ label: 'File', props: fileControlProps },
		{ label: 'Location', props: locationControlProps }
	];
</script>

<DocComponentPage
	{contentType}
	{metadata}
	{frontmatter}
	prev={{ label: 'Form', href: '/docs/components/form' }}
	next={{ label: 'Kbd', href: '/docs/components/kbd' }}
>
	{#snippet children()}
		<DocOnly for="markdown">
			**Type**: Compound Component ## Use Cases

			{#each metadata.useCases as uc, i (i)}
				- **{uc.title}**: {uc.description}
			{/each}
		</DocOnly>

		<DocSection title="Installation">
			<DocInstallation packageName={metadata.packageName} importCode={metadata.importCode} />
		</DocSection>

		<DocSection title="Input.Root" subtitle="The styled container — wrap every control with this">
			<DocOnly for="markdown">
				💡 **Why a compound component?** `Input.Root` is the shared styled shell. Every control
				lives inside one. Other components (dropdowns, selects) can reuse the same shell for visual
				consistency without rebuilding it.
			</DocOnly>
			<DocOnly for="html">
				<DocCallout variant="info" title="Why a compound component?">
					<code class="bg-muted rounded px-1.5 py-0.5 text-xs">Input.Root</code> is the shared styled
					shell. Every control lives inside one. Other components (dropdowns, selects) can reuse the same
					shell for visual consistency without rebuilding it.
				</DocCallout>
			</DocOnly>

			<DocExample
				title="With Icon"
				description="Prefix or suffix any element using Input.Icon."
				code={`<Input.Root>
  <Input.Icon>$</Input.Icon>
  <Input.TextControl placeholder="0.00" />
  <Input.Icon>.00</Input.Icon>
</Input.Root>`}
			>
				<Input.Root class="w-48">
					<Input.Icon class="text-foreground px-2">$</Input.Icon>
					<Input.TextControl placeholder="0.00" />
					<Input.Icon class="text-foreground px-2">.00</Input.Icon>
				</Input.Root>
			</DocExample>
		</DocSection>

		<DocSection
			title="Preset Configuration"
			subtitle="Customize the input appearance using presets"
		>
			<DocCode code={metadata.examples.preset} lang="typescript" />
		</DocSection>

		<DocSection title="Text Controls" subtitle="Plain text, password, search">
			<DocExample
				title="TextControl"
				description="The standard text input. Prefer this over Input.Control for type='text'."
				code={`<Input.Root>
  <Input.TextControl bind:value placeholder="Enter text…" />
</Input.Root>`}
			>
				<div class="space-y-3">
					<Input.Root class="w-72">
						<Input.TextControl bind:value={textValue} placeholder="Enter text…" />
					</Input.Root>
					{#if textValue}
						<p class="text-muted-foreground text-xs">Value: {textValue}</p>
					{/if}
				</div>
			</DocExample>

			<DocExample
				title="Password"
				description="Password input with show/hide toggle capability."
				code={`<Input.Root>
  <Input.PasswordControl bind:value placeholder="Password…" />
</Input.Root>`}
			>
				<Input.Root class="w-72">
					<Input.PasswordControl bind:value={passwordValue} placeholder="Password…" />
				</Input.Root>
			</DocExample>

			<DocExample
				title="Search"
				description="Search text input with semantic markup."
				code={`<Input.Root>
  <Input.TextControl bind:value type="search" placeholder="Search…" />
  <Input.Icon>⌕</Input.Icon>
</Input.Root>`}
			>
				<Input.Root class="w-72">
					<Input.TextControl bind:value={searchValue} type="search" placeholder="Search…" />
					<Input.Icon class="px-2.5 text-sm text-muted-foreground">
						<SearchIcon />
					</Input.Icon>
				</Input.Root>
			</DocExample>
		</DocSection>

		<DocSection title="Numeric Controls" subtitle="Numbers and money">
			<DocExample
				title="NumberControl"
				description="Numeric input with increment/decrement buttons and step."
				code={`<Input.Root>
  <Input.NumberControl bind:number step={1} />
</Input.Root>`}
			>
				<Input.Root class="w-44">
					<Input.NumberControl bind:number={numberValue} step={1} />
				</Input.Root>
			</DocExample>

			<DocExample
				title="CurrencyControl"
				description="Locale-aware currency input. Arrow Up/Down to increment (Shift×10, Alt×0.1)."
				code={`<Input.Root>
  <Input.CurrencyControl currency="USD" locale="en-US" min={0} bind:amount />
</Input.Root>`}
			>
				<div class="space-y-2">
					<Input.Root class="w-44">
						<Input.CurrencyControl
							currency="USD"
							locale="en-US"
							min={0}
							bind:value={currencyValue}
							bind:amount={currencyAmount}
						/>
					</Input.Root>
					{#if currencyAmount !== undefined}
						<p class="text-muted-foreground text-xs">Amount: {currencyAmount}</p>
					{/if}
				</div>
			</DocExample>
		</DocSection>

		<DocSection
			title="Date & Time Controls"
			subtitle="Segment-based pickers with keyboard navigation and rollover"
		>
			<DocExample
				title="TimeControl"
				description="12 or 24-hour segment picker with optional seconds and AM/PM."
				code={`<Input.Root>
  <Input.TimeControl bind:value hourFormat={12} />
</Input.Root>`}
			>
				<Input.Root class="w-fit">
					<Input.TimeControl bind:value={timeValue} hourFormat={12} />
				</Input.Root>
			</DocExample>

			<DocExample
				title="DateControl"
				description="Segment-based date picker (YYYY-MM-DD). Day clamps to month boundaries."
				code={`<Input.Root>
  <Input.DateControl bind:value />
</Input.Root>`}
			>
				<Input.Root class="w-fit">
					<Input.DateControl bind:value={dateValue} />
				</Input.Root>
			</DocExample>

			<DocExample
				title="DateTimeControl"
				description="Combined date + time picker with full rollover cascade across all segments."
				code={`<Input.Root>
  <Input.DateTimeControl bind:value />
</Input.Root>`}
			>
				<Input.Root class="w-fit">
					<Input.DateTimeControl bind:value={datetimeValue} />
				</Input.Root>
			</DocExample>
		</DocSection>

		<DocSection
			title="Contact & Address Controls"
			subtitle="Syntax-highlighted inputs for structured contact data"
		>
			<DocOnly for="markdown">
				💡 **Highlight CSS variables** These controls color their segments via `--input-hl-*` CSS
				variables. Define them in your theme to enable color; omit them for plain monochrome text.
			</DocOnly>
			<DocOnly for="html">
				<DocCallout variant="info" title="Highlight CSS variables">
					These controls color their segments via <code
						class="bg-muted rounded px-1.5 py-0.5 text-xs">--input-hl-*</code
					> CSS variables. Define them in your theme to enable color; omit them for plain monochrome text.
				</DocCallout>
			</DocOnly>

			<DocExample
				title="EmailControl"
				description="Email with local / @ / domain / TLD segment coloring."
				code={`<Input.Root>
  <Input.EmailControl bind:value placeholder="you@example.com" />
</Input.Root>`}
			>
				<Input.Root class="w-72">
					<Input.EmailControl bind:value={emailValue} placeholder="you@example.com" />
				</Input.Root>
			</DocExample>

			<DocExample
				title="UrlControl"
				description="URL with protocol, host, path, search, and hash segment coloring."
				code={`<Input.Root>
  <Input.UrlControl bind:value placeholder="https://example.com" />
</Input.Root>`}
			>
				<Input.Root class="w-80">
					<Input.UrlControl bind:value={urlValue} placeholder="https://example.com" />
				</Input.Root>
			</DocExample>

			<DocExample
				title="PhoneControl"
				description="Masked phone input. # = required digit, [#] = optional. Segment map controls coloring."
				code={`<Input.Root>
  <Input.PhoneControl
    bind:value
    format="(###) ###-####"
    segments={{ area: 3, prefix: 3, line: 4 }}
  />
</Input.Root>`}
			>
				<Input.Root class="w-52">
					<Input.PhoneControl
						bind:value={phoneValue}
						format="(###) ###-####"
						segments={{ area: 3, prefix: 3, line: 4 }}
					/>
				</Input.Root>
			</DocExample>

			<DocExample
				title="LocationControl"
				description="Coordinate input (lat, lng) in decimal degrees or DMS. Optional geolocation button."
				code={`<Input.Root>
  <Input.LocationControl bind:value format="dd" />
</Input.Root>`}
			>
				<Input.Root class="w-80">
					<Input.LocationControl bind:value={locationValue} format="dd" />
				</Input.Root>
			</DocExample>
		</DocSection>

		<DocSection
			title="Media & Selection Controls"
			subtitle="File upload, color picker, and verification codes"
		>
			<DocExample
				title="FileControl"
				description="File picker with accept filter and customizable trigger snippet."
				code={`<Input.Root>
  <Input.FileControl bind:files accept="image/*" multiple />
</Input.Root>`}
			>
				<div class="space-y-2">
					<Input.Root class="w-72">
						<Input.FileControl bind:files={fileList} accept="image/*" multiple />
					</Input.Root>
					{#if fileList.length}
						<p class="text-muted-foreground text-xs">{fileList.map((f) => f.name).join(', ')}</p>
					{/if}
				</div>
			</DocExample>

			<DocExample
				title="ColorControl"
				description="Segmented CSS color editor. Auto-detects format from value. Pair with ColorSwatch for a live preview."
				code={`<Input.Root>
  <Input.ColorSwatch />
  <Input.ColorControl bind:value />
</Input.Root>`}
			>
				<Input.Root class="w-fit gap-2 px-2">
					<Input.ColorSwatch />
					<Input.ColorControl bind:value={colorValue} />
				</Input.Root>
			</DocExample>

			<DocExample
				title="OtpControl"
				description="One-time password slots with keyboard navigation, paste support, and oncomplete callback."
				code={`<Input.Root>
  <Input.OtpControl
    length={6}
    type="numeric"
    bind:value
    oncomplete={(code) => verify(code)}
  />
</Input.Root>`}
			>
				<div class="space-y-2">
					<Input.Root class="w-80 px-2">
						<Input.OtpControl length={6} type="numeric" bind:value={otpValue} />
					</Input.Root>
					{#if otpValue.length === 6}
						<p class="text-muted-foreground text-xs">Code: {otpValue}</p>
					{/if}
				</div>
			</DocExample>
		</DocSection>

		<DocSection title="API Reference">
			<DocPropsTabs sections={apiSections} />
		</DocSection>

		<DocSection
			title="Compatibility"
			subtitle="Components and patterns designed to work with the Input module"
		>
			<DocOnly for="markdown">
				## Works inside Input.Root - **Input.TextControl** — Plain text input with bond wiring -
				**Input.PasswordControl** — Password input with show/hide toggle - **Input.EmailControl** —
				Email with local/domain/TLD segment coloring - **Input.UrlControl** — URL with protocol,
				host, path and hash coloring - **Input.PhoneControl** — Masked phone input with segment
				color map - **Input.NumberControl** — Numeric stepper with increment/decrement buttons -
				**Input.CurrencyControl** — Locale-aware currency input with formatted overlay -
				**Input.TimeControl** — Segment-based 12/24h time picker - **Input.DateControl** —
				Segment-based date picker - **Input.DateTimeControl** — Combined date + time picker -
				**Input.ColorControl** — CSS color editor with per-channel segments - **Input.ColorSwatch**
				— Live color preview (reads bond automatically) - **Input.OtpControl** — One-time password
				slot grid - **Input.FileControl** — File upload trigger with custom snippet -
				**Input.LocationControl** — Coordinates input with lat/lng bindables - **Input.Icon** —
				Leading or trailing icon slot - **Input.Placeholder** — Floating overlay placeholder ##
				Related Standalone Components - **Swatch** — Bond-free color preview square. Use outside of
				`Input.Root` when you need a standalone swatch - **Popover** — `Input.Root` can act as a
				popover trigger for dropdowns - **Label** — Accessible label element. Pair with `Input.Root`
				via `htmlFor` - **Form / Field** — Wraps inputs with label, helper text, and validation
				messages
			</DocOnly>

			<DocOnly for="html">
				<div class="space-y-8">
					<div>
						<h3 class="text-foreground mb-3 text-sm font-semibold uppercase tracking-wide">
							Works inside Input.Root
						</h3>
						<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{#each [{ name: 'Input.TextControl', desc: 'Plain text input with bond wiring.' }, { name: 'Input.PasswordControl', desc: 'Password input with show/hide toggle.' }, { name: 'Input.EmailControl', desc: 'Email with local/domain/TLD segment coloring.' }, { name: 'Input.UrlControl', desc: 'URL with protocol, host, path and hash coloring.' }, { name: 'Input.PhoneControl', desc: 'Masked phone input with segment color map.' }, { name: 'Input.NumberControl', desc: 'Numeric stepper with increment/decrement buttons.' }, { name: 'Input.CurrencyControl', desc: 'Locale-aware currency input with formatted overlay.' }, { name: 'Input.TimeControl', desc: 'Segment-based 12/24h time picker.' }, { name: 'Input.DateControl', desc: 'Segment-based date picker.' }, { name: 'Input.DateTimeControl', desc: 'Combined date + time picker.' }, { name: 'Input.ColorControl', desc: 'CSS color editor with per-channel segments.' }, { name: 'Input.ColorSwatch', desc: 'Live color preview — reads bond automatically.' }, { name: 'Input.OtpControl', desc: 'One-time password slot grid.' }, { name: 'Input.FileControl', desc: 'File upload trigger with custom snippet.' }, { name: 'Input.LocationControl', desc: 'Coordinates input with lat/lng bindables.' }, { name: 'Input.Icon', desc: 'Leading or trailing icon slot.' }, { name: 'Input.Placeholder', desc: 'Floating overlay placeholder.' }] as item (item.name)}
								<div class="border-border bg-muted/30 rounded-lg border p-3">
									<div class="mb-1">
										<code class="text-foreground text-xs font-medium">{item.name}</code>
									</div>
									<p class="text-muted-foreground text-xs">{item.desc}</p>
								</div>
							{/each}
						</div>
					</div>

					<div>
						<h3 class="text-foreground mb-3 text-sm font-semibold uppercase tracking-wide">
							Related standalone components
						</h3>
						<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<div class="border-border bg-muted/30 rounded-lg border p-3">
								<div class="mb-1">
									<a
										href="/docs/components/swatch"
										class="text-foreground text-sm font-medium underline underline-offset-2 hover:no-underline"
									>
										<code class="text-xs">Swatch</code>
									</a>
								</div>
								<p class="text-muted-foreground text-xs">
									Bond-free color preview square. Use outside of Input.Root when you need a
									standalone swatch.
									<code class="bg-muted rounded px-1 py-0.5 text-xs">Input.ColorSwatch</code> is its bond-connected
									counterpart.
								</p>
							</div>
							<div class="border-border bg-muted/30 rounded-lg border p-3">
								<div class="mb-1">
									<span class="text-foreground text-sm font-medium">Popover</span>
								</div>
								<p class="text-muted-foreground text-xs">
									<code class="bg-muted rounded px-1 py-0.5 text-xs">Input.Root</code> can act as a
									popover trigger for any dropdown — combine it with a
									<code class="bg-muted rounded px-1 py-0.5 text-xs">Popover</code> to build custom pickers,
									suggestions, or autocomplete panels.
								</p>
							</div>
							<div class="border-border bg-muted/30 rounded-lg border p-3">
								<div class="mb-1">
									<span class="text-foreground text-sm font-medium">Color Picker</span>
								</div>
								<p class="text-muted-foreground text-xs">
									<code class="bg-muted rounded px-1 py-0.5 text-xs">Input.ColorControl</code> handles
									raw color string editing. Pair it with a full color picker popover for a visual hue/saturation
									canvas alongside the segment input.
								</p>
							</div>
							<div class="border-border bg-muted/30 rounded-lg border p-3">
								<div class="mb-1">
									<span class="text-foreground text-sm font-medium">Time Picker</span>
								</div>
								<p class="text-muted-foreground text-xs">
									<code class="bg-muted rounded px-1 py-0.5 text-xs">Input.TimeControl</code> provides
									keyboard-driven segment editing. Pair it with a clock-face or scrollable time picker
									popover for mouse/touch selection.
								</p>
							</div>
							<div class="border-border bg-muted/30 rounded-lg border p-3">
								<div class="mb-1">
									<span class="text-foreground text-sm font-medium">Date Picker / Calendar</span>
								</div>
								<p class="text-muted-foreground text-xs">
									<code class="bg-muted rounded px-1 py-0.5 text-xs">Input.DateControl</code> and
									<code class="bg-muted rounded px-1 py-0.5 text-xs">Input.DateTimeControl</code>
									handle typed date entry. Pair them with a
									<a
										href="/docs/components/calendar"
										class="text-foreground underline underline-offset-2 hover:no-underline"
										>Calendar</a
									> popover for click-to-select.
								</p>
							</div>
							<div class="border-border bg-muted/30 rounded-lg border p-3">
								<div class="mb-1">
									<a
										href="/docs/components/label"
										class="text-foreground text-sm font-medium underline underline-offset-2 hover:no-underline"
									>
										<code class="text-xs">Label</code>
									</a>
								</div>
								<p class="text-muted-foreground text-xs">
									Accessible label element. Pair with <code
										class="bg-muted rounded px-1 py-0.5 text-xs">Input.Root</code
									>
									via
									<code class="bg-muted rounded px-1 py-0.5 text-xs">htmlFor</code> or by wrapping the
									input.
								</p>
							</div>
							<div class="border-border bg-muted/30 rounded-lg border p-3">
								<div class="mb-1">
									<a
										href="/docs/components/form"
										class="text-foreground text-sm font-medium underline underline-offset-2 hover:no-underline"
									>
										<code class="text-xs">Form / Field</code>
									</a>
								</div>
								<p class="text-muted-foreground text-xs">
									Wraps inputs with label, helper text, and validation messages. Designed to compose
									with any Input control.
								</p>
							</div>
						</div>
					</div>
				</div>
			</DocOnly>
		</DocSection>

		<DocSection title="Accessibility">
			<DocAccessibility features={metadata.accessibility} />
		</DocSection>

		<DocOnly for="markdown">
			{newLine(2)}## License MIT License
		</DocOnly>
	{/snippet}
</DocComponentPage>
