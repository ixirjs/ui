<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Input as MyInput } from '..';
	import { Label } from '../../label';
	import { OtpControl } from '../atoms';

	const { Story } = defineMeta({
		title: 'Atoms/Input',

		parameters: {
			layout: 'centered'
		},
		args: {
			placeholder: 'Type something…',
			disabled: false,
			readonly: false,
			type: 'text'
		},
		argTypes: {
			placeholder: {
				control: 'text',
				description: 'Placeholder text shown when the field is empty'
			},
			disabled: {
				control: 'boolean',
				description: 'Disable the input, preventing interaction'
			},
			readonly: {
				control: 'boolean',
				description: 'Make the input read-only (value visible but not editable)'
			},
			type: {
				control: 'select',
				options: ['text', 'password'],
				description: 'Control variant to render inside the root'
			}
		}
	});
</script>

<script lang="ts">
	let timeValue = $state('');
	let dateTimeValue = $state('');
	let dateTimeDate = $state<Date | null>(null);
	let dateValue = $state('');
	let dateDate = $state<Date | null>(null);
	let files = $state<File[]>([]);
	let urlValue = $state('');
	let phoneValue = $state('');
	let locationValue = $state('');
	let otpValue = $state('');
	let otpCompleted = $state(false);
	let currencyValue = $state('');
	let currencyAmount = $state<number | undefined>(undefined);
	let colorValue = $state('');
	let locationLat = $state<number | undefined>(undefined);
	let locationLng = $state<number | undefined>(undefined);

	let today = $state(new Date());
</script>

<Story
	name="Basic"
	args={{ placeholder: 'Type something…', disabled: false, readonly: false, type: 'text' }}
>
	{#snippet template(args)}
		<div class="flex w-72 flex-col gap-1">
			<Label>Label</Label>
			<MyInput.Root>
				{#if args.type === 'password'}
					<MyInput.PasswordControl
						placeholder={args.placeholder}
						disabled={args.disabled}
						readonly={args.readonly}
					/>
				{:else}
					<MyInput.TextControl
						placeholder={args.placeholder}
						disabled={args.disabled}
						readonly={args.readonly}
					/>
				{/if}
			</MyInput.Root>
		</div>
	{/snippet}
</Story>

<Story name="Text Variants" parameters={{ layout: 'fullscreen' }}>
	<div class="flex flex-col gap-4 p-4">
		<div class="flex flex-col gap-1">
			<Label>Default</Label>
			<MyInput.Root class="w-72">
				<MyInput.TextControl placeholder="Enter text…" />
			</MyInput.Root>
		</div>

		<div class="flex flex-col gap-1">
			<Label>Disabled</Label>
			<MyInput.Root class="w-72">
				<MyInput.TextControl value="Prefilled value" disabled />
			</MyInput.Root>
		</div>

		<div class="flex flex-col gap-1">
			<Label>Readonly</Label>
			<MyInput.Root class="w-72">
				<MyInput.TextControl value="Read-only value" readonly />
			</MyInput.Root>
		</div>

		<div class="flex flex-col gap-1">
			<Label>Password</Label>
			<MyInput.Root class="w-72">
				<MyInput.PasswordControl placeholder="Enter password…" />
			</MyInput.Root>
		</div>

		<div class="flex flex-col gap-1">
			<Label>With leading icon</Label>
			<MyInput.Root class="w-72">
				<MyInput.Icon class="text-muted-foreground">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="h-4 w-4"
					>
						<circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
					</svg>
				</MyInput.Icon>
				<MyInput.TextControl placeholder="Search…" />
			</MyInput.Root>
		</div>

		<div class="flex flex-col gap-1">
			<Label>With placeholder overlay</Label>
			<MyInput.Root class="w-72">
				<div class="relative flex-1">
					<MyInput.TextControl class="pr-2" placeholder="" />
					<MyInput.Placeholder class="text-foreground/30 pl-2">name@example.com</MyInput.Placeholder
					>
				</div>
			</MyInput.Root>
		</div>
	</div>
</Story>

<Story name="Currency" parameters={{ layout: 'fullscreen' }}>
	<div class="flex flex-col">
		<Label for="price-input">Price</Label>
		<MyInput.Root>
			<MyInput.Icon class="text-foreground box-content px-0">$</MyInput.Icon>
			<div class="relative flex-1">
				<MyInput.Control
					id="price-input"
					class="border-border box-content border-x px-2 py-2"
					type="currency"
				/>
				<MyInput.Placeholder class="text-foreground/20 pl-2">Hello World</MyInput.Placeholder>
			</div>
			<MyInput.Icon class="text-foreground box-content px-2">.00</MyInput.Icon>
		</MyInput.Root>
	</div>
</Story>

<Story name="Number Control" parameters={{ layout: 'fullscreen' }}>
	<div class="flex flex-col gap-4 p-4">
		<div class="flex flex-col gap-1">
			<Label>Quantity</Label>
			<MyInput.Root>
				<MyInput.NumberControl number={1} min={0} max={99} />
			</MyInput.Root>
		</div>

		<div class="flex flex-col gap-1">
			<Label>Step 5</Label>
			<MyInput.Root>
				<MyInput.NumberControl number={0} min={0} max={100} step={5} />
			</MyInput.Root>
		</div>

		<div class="flex flex-col gap-1">
			<Label>Disabled</Label>
			<MyInput.Root>
				<MyInput.NumberControl number={3} disabled />
			</MyInput.Root>
		</div>

		<div class="flex flex-col gap-1">
			<Label>Custom buttons</Label>
			<MyInput.Root>
				<MyInput.NumberControl number={0}>
					{#snippet decrement({ action, disabled })}
						<button onclick={action} {disabled} class="px-3 text-lg font-bold disabled:opacity-30"
							>−</button
						>
					{/snippet}
					{#snippet increment({ action, disabled })}
						<button onclick={action} {disabled} class="px-3 text-lg font-bold disabled:opacity-30"
							>+</button
						>
					{/snippet}
				</MyInput.NumberControl>
			</MyInput.Root>
		</div>
	</div>
</Story>

<!-- TimeControl -->
<Story name="Time Control" parameters={{ layout: 'fullscreen' }}>
	<div class="flex flex-col gap-4 p-4">
		<MyInput.Root class="border-border flex h-10 w-64 items-center rounded-md border">
			<MyInput.TimeControl bind:value={timeValue} bind:date={today} hourFormat={12} />
		</MyInput.Root>
		<p class="text-muted-foreground text-sm">Value: {timeValue || '(none)'}</p>
		<p class="text-muted-foreground text-sm">Date: {today.toLocaleString()}</p>
	</div>
</Story>

<Story name="Time Control (WithRange)" parameters={{ layout: 'fullscreen' }}>
	<div class="flex flex-col gap-4 p-4">
		<p class="text-muted-foreground text-sm">08:00 – 18:00 only</p>
		<MyInput.Root class="border-border flex h-10 w-64 items-center rounded-md border">
			<MyInput.TimeControl bind:value={timeValue} min="08:00" max="18:00" hourFormat={24} />
		</MyInput.Root>
	</div>
</Story>

<!-- DateTimeControl -->
<Story name="Date Time Control" parameters={{ layout: 'fullscreen' }}>
	<div class="flex flex-col gap-4 p-4">
		<MyInput.Root class="border-border flex h-10 w-72 items-center rounded-md border">
			<MyInput.DateTimeControl bind:value={dateTimeValue} bind:date={dateTimeDate} />
		</MyInput.Root>
		<p class="text-muted-foreground text-sm">
			String: {dateTimeValue || '(none)'}<br />
			Date: {dateTimeDate?.toLocaleString() ?? '(none)'}
		</p>
	</div>
</Story>

<!-- DateControl -->
<Story name="Date Control" parameters={{ layout: 'fullscreen' }}>
	<div class="flex flex-col gap-4 p-4">
		<div class="flex flex-col gap-1">
			<Label>Date only</Label>
			<MyInput.Root class="border-border flex h-10 w-48 items-center rounded-md border">
				<MyInput.DateControl mode="date" bind:value={dateValue} bind:date={dateDate} />
			</MyInput.Root>
			<p class="text-muted-foreground text-sm">
				String: {dateValue || '(none)'}<br />
				Date: {dateDate?.toLocaleDateString() ?? '(none)'}
			</p>
		</div>

		<div class="flex flex-col gap-1">
			<Label>Disabled</Label>
			<MyInput.Root class="border-border flex h-10 w-48 items-center rounded-md border">
				<MyInput.DateControl mode="date" value="2025-06-15" disabled />
			</MyInput.Root>
		</div>

		<div class="flex flex-col gap-1">
			<Label>Readonly</Label>
			<MyInput.Root class="border-border flex h-10 w-48 items-center rounded-md border">
				<MyInput.DateControl mode="date" value="2025-06-15" readonly />
			</MyInput.Root>
		</div>

		<div class="flex flex-col gap-1">
			<Label>Pre-filled</Label>
			<MyInput.Root class="border-border flex h-10 w-48 items-center rounded-md border">
				<MyInput.DateControl mode="date" bind:value={dateValue} bind:date={dateDate} />
			</MyInput.Root>
			<button
				class="text-muted-foreground hover:text-foreground w-fit text-sm underline"
				onclick={() => {
					dateValue = '2000-01-01';
				}}>Set Jan 1, 2000</button
			>
			<button
				class="text-muted-foreground hover:text-foreground w-fit text-sm underline"
				onclick={() => {
					dateValue = '';
				}}>Clear</button
			>
		</div>
	</div>
</Story>

<!-- FileControl -->
<Story name="File Control" parameters={{ layout: 'fullscreen' }}>
	<div class="flex flex-col gap-4 p-4">
		<MyInput.Root class="border-border flex h-10 w-80 items-center rounded-md border">
			<MyInput.FileControl bind:files placeholder="Choose a file…" />
		</MyInput.Root>
		{#if files.length}
			<p class="text-muted-foreground text-sm">{files.length} file(s) selected</p>
		{/if}
	</div>
</Story>

<Story name="File Control (Multiple)" parameters={{ layout: 'fullscreen' }}>
	<div class="flex flex-col gap-4 p-4">
		<MyInput.Root class="border-border flex h-10 w-80 items-center rounded-md border">
			<MyInput.FileControl bind:files multiple accept="image/*" placeholder="Choose images…" />
		</MyInput.Root>
	</div>
</Story>

<Story name="File Control (CustomTrigger)" parameters={{ layout: 'fullscreen' }}>
	<div class="flex flex-col gap-4 p-4">
		<MyInput.Root class="border-border flex h-10 w-80 items-center rounded-md border">
			<MyInput.FileControl bind:files>
				{#snippet triggerContent({ hasFiles, files: f, open })}
					{#if hasFiles}
						<span class="text-foreground px-2 text-sm">{f[0]?.name}</span>
					{:else}
						<button type="button" onclick={open} class="text-primary px-2 text-sm underline">
							Upload file
						</button>
					{/if}
				{/snippet}
			</MyInput.FileControl>
		</MyInput.Root>
	</div>
</Story>

<!-- UrlControl -->
<Story name="Url Control" parameters={{ layout: 'fullscreen' }}>
	<div class="flex flex-col gap-4 p-4">
		<MyInput.Root class="border-border flex h-10 w-80 items-center rounded-md border">
			<MyInput.UrlControl bind:value={urlValue} placeholder="example.com" />
		</MyInput.Root>
		<p class="text-muted-foreground text-sm">Value: {urlValue || '(none)'}</p>
	</div>
</Story>

<Story name="Url Control (HttpScheme)" parameters={{ layout: 'fullscreen' }}>
	<div class="flex flex-col gap-4 p-4">
		<MyInput.Root class="border-border flex h-10 w-80 items-center rounded-md border">
			<MyInput.UrlControl bind:value={urlValue} placeholder="example.com" />
		</MyInput.Root>
	</div>
</Story>

<!-- PhoneControl -->
<Story name="Phone Control" parameters={{ layout: 'fullscreen' }}>
	<div class="flex flex-col gap-4 p-4">
		<MyInput.Root class="border-border flex h-10 w-64 items-center rounded-md border">
			<MyInput.PhoneControl bind:value={phoneValue} format="+# (###) ###-####" />
		</MyInput.Root>
		<p class="text-muted-foreground text-sm">Value: {phoneValue || '(none)'}</p>
	</div>
</Story>

<Story name="Phone Control (UK)" parameters={{ layout: 'fullscreen' }}>
	<div class="flex flex-col gap-4 p-4">
		<MyInput.Root class="border-border flex h-10 w-64 items-center rounded-md border">
			<MyInput.PhoneControl
				bind:value={phoneValue}
				format="+44 #### ######"
				placeholder="7700 900000"
			/>
		</MyInput.Root>
	</div>
</Story>

<!-- LocationControl -->
<Story name="Location Control" parameters={{ layout: 'fullscreen' }}>
	<div class="flex flex-col gap-4 p-4">
		<div class="flex flex-col gap-1">
			<Label>Decimal degrees (default)</Label>
			<MyInput.Root class="border-border flex h-10 w-80 items-center rounded-md border">
				<MyInput.LocationControl
					bind:value={locationValue}
					bind:lat={locationLat}
					bind:lng={locationLng}
					format="dd"
					placeholder="lat, lng"
				/>
			</MyInput.Root>
		</div>

		<div class="text-muted-foreground grid grid-cols-3 gap-x-4 text-sm">
			<span>value: <span class="text-foreground font-mono">{locationValue || '(none)'}</span></span>
			<span
				>lat: <span class="text-emerald-600 dark:text-emerald-400 font-mono"
					>{locationLat ?? '—'}</span
				></span
			>
			<span
				>lng: <span class="text-sky-600 dark:text-sky-400 font-mono">{locationLng ?? '—'}</span
				></span
			>
		</div>
	</div>
</Story>

<Story name="Location Control (DMS)" parameters={{ layout: 'fullscreen' }}>
	<div class="flex flex-col gap-4 p-4">
		<div class="flex flex-col gap-1">
			<Label>Degrees, minutes, seconds overlay</Label>
			<MyInput.Root class="border-border flex h-10 w-96 items-center rounded-md border">
				<MyInput.LocationControl
					bind:value={locationValue}
					bind:lat={locationLat}
					bind:lng={locationLng}
					format="dms"
				/>
			</MyInput.Root>
		</div>
		<div class="text-muted-foreground text-sm">
			value: <span class="text-foreground font-mono">{locationValue || '(none)'}</span>
		</div>
	</div>
</Story>

<Story name="Location Control (Precision)" parameters={{ layout: 'fullscreen' }}>
	<div class="flex flex-col gap-4 p-4">
		<div class="flex flex-col gap-1">
			<Label>2 decimal places</Label>
			<MyInput.Root class="border-border flex h-10 w-72 items-center rounded-md border">
				<MyInput.LocationControl
					bind:value={locationValue}
					bind:lat={locationLat}
					bind:lng={locationLng}
					format="dd"
					precision={2}
				/>
			</MyInput.Root>
		</div>

		<div class="flex flex-col gap-1">
			<Label>4 decimal places</Label>
			<MyInput.Root class="border-border flex h-10 w-72 items-center rounded-md border">
				<MyInput.LocationControl
					bind:value={locationValue}
					bind:lat={locationLat}
					bind:lng={locationLng}
					format="dd"
					precision={4}
				/>
			</MyInput.Root>
		</div>

		<div class="flex flex-col gap-1">
			<Label>8 decimal places (max GPS precision)</Label>
			<MyInput.Root class="border-border flex h-10 w-96 items-center rounded-md border">
				<MyInput.LocationControl
					bind:value={locationValue}
					bind:lat={locationLat}
					bind:lng={locationLng}
					format="dd"
					precision={8}
				/>
			</MyInput.Root>
		</div>
	</div>
</Story>

<Story name="Location Control (NoLocate)" parameters={{ layout: 'fullscreen' }}>
	<div class="flex flex-col gap-4 p-4">
		<div class="flex flex-col gap-1">
			<Label>Without geolocation button</Label>
			<MyInput.Root class="border-border flex h-10 w-72 items-center rounded-md border">
				<MyInput.LocationControl
					bind:value={locationValue}
					locate={false}
					placeholder="Enter coordinates manually"
				/>
			</MyInput.Root>
		</div>
	</div>
</Story>

<Story name="Location Control (States)" parameters={{ layout: 'fullscreen' }}>
	<div class="flex flex-col gap-4 p-4">
		<div class="flex flex-col gap-1">
			<Label>Disabled</Label>
			<MyInput.Root class="border-border flex h-10 w-80 items-center rounded-md border">
				<MyInput.LocationControl value="40.712800, -74.006000" disabled />
			</MyInput.Root>
		</div>

		<div class="flex flex-col gap-1">
			<Label>Readonly</Label>
			<MyInput.Root class="border-border flex h-10 w-80 items-center rounded-md border">
				<MyInput.LocationControl value="51.507351, -0.127758" readonly />
			</MyInput.Root>
		</div>

		<div class="flex flex-col gap-1">
			<Label>Prefilled (New York)</Label>
			<MyInput.Root class="border-border flex h-10 w-80 items-center rounded-md border">
				<MyInput.LocationControl value="40.712800, -74.006000" />
			</MyInput.Root>
		</div>

		<div class="flex flex-col gap-1">
			<Label>Prefilled DMS (Paris)</Label>
			<MyInput.Root class="border-border flex h-10 w-96 items-center rounded-md border">
				<MyInput.LocationControl value="48.8566, 2.3522" format="dms" />
			</MyInput.Root>
		</div>
	</div>
</Story>

<Story name="Location Control (WithIcon)" parameters={{ layout: 'fullscreen' }}>
	<div class="flex flex-col gap-4 p-4">
		<div class="flex flex-col gap-1">
			<Label>With leading icon</Label>
			<MyInput.Root class="border-border flex h-10 w-96 items-center rounded-md border">
				<MyInput.Icon class="py-2.5 text-muted-foreground">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
						<circle cx="12" cy="10" r="3" />
					</svg>
				</MyInput.Icon>
				<MyInput.LocationControl
					bind:value={locationValue}
					bind:lat={locationLat}
					bind:lng={locationLng}
					format="dd"
				/>
			</MyInput.Root>
		</div>
	</div>
</Story>

<!-- OTP Control -->
<Story name="OTP Control" parameters={{ layout: 'fullscreen' }}>
	<div class="flex flex-col gap-6 p-4">
		<div class="flex flex-col gap-2">
			<Label>Inside Input.Root (integrated)</Label>
			<MyInput.Root
				class="border-border flex h-10 w-72 items-center rounded-md border overflow-hidden"
			>
				<MyInput.OtpControl
					bind:value={otpValue}
					oncomplete={() => {
						otpCompleted = true;
					}}
				/>
			</MyInput.Root>
			<p class="text-muted-foreground text-sm">
				Value: <span class="text-foreground font-mono">{otpValue || '(none)'}</span>
				{#if otpCompleted}
					<span class="text-emerald-600 font-medium ml-2">✓ Complete</span>{/if}
			</p>
		</div>

		<div class="flex flex-col gap-2">
			<Label>Inside Input.Root — grouped (3+3)</Label>
			<MyInput.Root
				class="border-border flex h-10 w-64 items-center rounded-md border overflow-hidden"
			>
				<MyInput.OtpControl length={6} groupSize={3} />
			</MyInput.Root>
		</div>

		<div class="flex flex-col gap-2">
			<Label>Standalone — individual boxes (default)</Label>
			<OtpControl
				length={6}
				oncomplete={() => {
					otpCompleted = true;
				}}
			/>
		</div>

		<div class="flex flex-col gap-2">
			<Label>Standalone — 4-digit PIN</Label>
			<OtpControl length={4} placeholder="○" />
		</div>

		<div class="flex flex-col gap-2">
			<Label>Standalone — 8-char alphanumeric grouped (4+4)</Label>
			<OtpControl length={8} type="alphanumeric" groupSize={4} />
		</div>

		<div class="flex flex-col gap-2">
			<Label>Disabled</Label>
			<OtpControl length={6} value="123456" disabled />
		</div>

		<div class="flex flex-col gap-2">
			<Label>Readonly</Label>
			<OtpControl length={6} value="123456" readonly />
		</div>
	</div>
</Story>

<!-- Currency Control -->
<Story name="Currency Control" parameters={{ layout: 'fullscreen' }}>
	<div class="flex flex-col gap-6 p-4">
		<div class="flex flex-col gap-2">
			<Label>USD (default)</Label>
			<MyInput.Root class="border-border flex h-10 w-48 items-center rounded-md border">
				<MyInput.CurrencyControl bind:value={currencyValue} bind:amount={currencyAmount} />
			</MyInput.Root>
			<p class="text-muted-foreground text-sm">
				Value: <span class="text-foreground font-mono">{currencyValue || '(none)'}</span> · Amount:
				<span class="text-foreground font-mono">{currencyAmount ?? '(none)'}</span>
			</p>
		</div>

		<div class="flex flex-col gap-2">
			<Label>EUR</Label>
			<MyInput.Root class="border-border flex h-10 w-48 items-center rounded-md border">
				<MyInput.CurrencyControl currency="EUR" locale="de-DE" amount={1234.56} />
			</MyInput.Root>
		</div>

		<div class="flex flex-col gap-2">
			<Label>JPY (no decimals)</Label>
			<MyInput.Root class="border-border flex h-10 w-48 items-center rounded-md border">
				<MyInput.CurrencyControl currency="JPY" locale="ja-JP" precision={0} amount={12500} />
			</MyInput.Root>
		</div>

		<div class="flex flex-col gap-2">
			<Label>Pre-filled</Label>
			<MyInput.Root class="border-border flex h-10 w-48 items-center rounded-md border">
				<MyInput.CurrencyControl bind:amount={currencyAmount} currency="USD" />
			</MyInput.Root>
			<div class="flex gap-2">
				<button
					class="text-muted-foreground hover:text-foreground text-sm underline"
					onclick={() => {
						currencyAmount = 9999.99;
					}}>Set $9,999.99</button
				>
				<button
					class="text-muted-foreground hover:text-foreground text-sm underline"
					onclick={() => {
						currencyAmount = undefined;
						currencyValue = '';
					}}>Clear</button
				>
			</div>
		</div>

		<div class="flex flex-col gap-2">
			<Label>Disabled</Label>
			<MyInput.Root class="border-border flex h-10 w-48 items-center rounded-md border">
				<MyInput.CurrencyControl amount={42.5} disabled />
			</MyInput.Root>
		</div>

		<div class="flex flex-col gap-2">
			<Label>Readonly</Label>
			<MyInput.Root class="border-border flex h-10 w-48 items-center rounded-md border">
				<MyInput.CurrencyControl amount={42.5} readonly />
			</MyInput.Root>
		</div>
	</div>
</Story>

<!-- Color Control -->
<Story name="Color Control" parameters={{ layout: 'fullscreen' }}>
	<div class="flex flex-col gap-4 p-4">
		<!-- Format grid -->
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{#each [{ label: 'Hex 6', value: '#1a2b3c' }, { label: 'Hex 8 (alpha)', value: '#1a2b3cff' }, { label: 'RGB', value: 'rgb(26, 43, 60)' }, { label: 'RGBA', value: 'rgba(26, 43, 60, 0.5)' }, { label: 'HSL', value: 'hsl(210deg 40% 17%)' }, { label: 'HSLA', value: 'hsla(210, 40%, 17%, 0.8)' }, { label: 'HWB', value: 'hwb(210 10% 76%)' }, { label: 'Lab', value: 'lab(17 -3.5 -12)' }, { label: 'LCH', value: 'lch(17 12.5 253deg)' }, { label: 'OKLab', value: 'oklab(0.27 -0.02 -0.06)' }, { label: 'OKLCH', value: 'oklch(0.27 0.06 253deg)' }, { label: 'display-p3', value: 'color(display-p3 0.1 0.17 0.24)' }, { label: 'Named — cornflowerblue', value: 'cornflowerblue' }, { label: 'Named — rebeccapurple', value: 'rebeccapurple' }, { label: 'Named — transparent', value: 'transparent' }] as item (item.label)}
				<div class="flex flex-col gap-1">
					<Label>{item.label}</Label>
					<MyInput.Root class="border-border flex h-9 items-center gap-2 rounded-md border px-2">
						<MyInput.ColorSwatch />
						<MyInput.ColorControl value={item.value} />
					</MyInput.Root>
				</div>
			{/each}
		</div>

		<!-- Editable / special cases -->
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
			<div class="flex flex-col gap-1">
				<Label>Editable</Label>
				<MyInput.Root class="border-border flex h-9 items-center gap-2 rounded-md border px-2">
					<MyInput.ColorSwatch />
					<MyInput.ColorControl bind:value={colorValue} placeholder="#rrggbb or oklch(…)" />
				</MyInput.Root>
				<p class="text-muted-foreground font-mono text-xs">{colorValue || '(empty)'}</p>
			</div>

			<div class="flex flex-col gap-1">
				<Label>Editable — Named</Label>
				<MyInput.Root class="border-border flex h-9 items-center gap-2 rounded-md border px-2">
					<MyInput.ColorSwatch />
					<MyInput.ColorControl format="named" placeholder="e.g. red, cornflowerblue" />
				</MyInput.Root>
			</div>

			<div class="flex flex-col gap-1">
				<Label>Disabled</Label>
				<MyInput.Root class="border-border flex h-9 items-center gap-2 rounded-md border px-2">
					<MyInput.ColorSwatch />
					<MyInput.ColorControl value="oklch(0.27 0.06 253deg)" disabled />
				</MyInput.Root>
			</div>
		</div>
	</div>
</Story>
