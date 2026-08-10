<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FormRoot from '$ixirjs/ui/components/form/form-root.svelte';
	import { Field } from '$ixirjs/ui/components/form/field';
	import { Input } from '$ixirjs/ui/components/input';
	import { Checkbox } from '$ixirjs/ui/components/checkbox';
	import { Radio, RadioGroup } from '$ixirjs/ui/components/radio';

	const { Story } = defineMeta({
		title: 'Atoms/Form',
		parameters: {
			layout: 'centered'
		},
		args: {
			disabled: false,
			readonly: false
		},
		argTypes: {
			disabled: {
				control: 'boolean',
				description: 'Disable all fields within the form'
			},
			readonly: {
				control: 'boolean',
				description: 'Make all fields read-only'
			}
		}
	});
</script>

<script lang="ts">
	import { z } from 'zod';
	import { writable } from 'svelte/store';
	import { superformsSource } from '$ixirjs/ui/components/form';

	const profileSchema = z.object({
		firstName: z.string().trim().min(2, 'First name must be at least 2 characters.'),
		lastName: z.string().trim().min(2, 'Last name must be at least 2 characters.'),
		email: z.string().email('Please enter a valid email.'),
		isAdmin: z.boolean(),
		theme: z.enum(['light', 'dark'])
	});

	const signupSchema = z.object({
		name: z.string().trim().min(3, 'Display name must be at least 3 characters.'),
		agreeToTerms: z.boolean().refine((value) => value, {
			message: 'You must accept terms to continue.'
		})
	});

	let firstName = $state('');
	let lastName = $state('');
	let email = $state('');
	let isAdmin = $state(false);
	let theme = $state('light');

	let name = $state('');
	let agreeToTerms = $state(false);

	const accountSchema = z.object({
		email: z.string().email('Enter a valid email.'),
		address: z.object({ street: z.string().min(1, 'Street is required.') })
	});

	let accountEmail = $state('');
	let accountStreet = $state('');
	let accountMode = $state<'touched' | 'blur' | 'input' | 'submit'>('touched');
	let accountForm = $state<ReturnType<typeof FormRoot> | undefined>();

	let serverUsername = $state('ada');
	let serverErrors = $state<Record<string, string[]>>({ username: ['That name is taken.'] });

	// Stands in for `superForm(data.form)` — the bridge is typed structurally, so any object with
	// these readables works and the story costs no `sveltekit-superforms` dependency.
	const sfErrors = writable<Record<string, string[] | Record<string, string[]>>>({
		address: { street: ['Street is required.'] }
	});
	const sfForm = writable<Record<string, unknown>>({ address: { street: '' } });
	const sfSubmitting = writable(false);
	const sfSource = superformsSource({ form: sfForm, errors: sfErrors, submitting: sfSubmitting });
	let sfStreet = $state('');
</script>

<Story name="Basic">
	{#snippet template(args)}
		<FormRoot class="flex w-full max-w-sm flex-col gap-4 p-6">
			<header class="space-y-1">
				<h2 class="text-xl font-semibold">Contact</h2>
				<p class="text-muted-foreground text-sm">A simple single-field form.</p>
			</header>

			<Field.Root
				disabled={args.disabled}
				readonly={args.readonly}
				name="email"
				schema={profileSchema.shape.email}
				value={email}
			>
				<Field.Label>Email address</Field.Label>
				<Input.Root>
					<Field.Control
						base={Input.Control as unknown as never}
						type="email"
						bind:value={email}
						placeholder="you@example.com"
					/>
				</Input.Root>
				<Field.HelperText>We will never share your email with anyone.</Field.HelperText>
				<Field.Error />
			</Field.Root>

			<button
				type="submit"
				class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-2 text-sm"
			>
				Subscribe
			</button>
		</FormRoot>
	{/snippet}
</Story>

<Story name="Profile Editor">
	<FormRoot class="flex w-full max-w-4xl flex-col gap-6 p-6">
		<header class="space-y-1">
			<h2 class="text-xl font-semibold">Team Profile</h2>
			<p class="text-muted-foreground text-sm">
				Composed form with text, checkbox, and radio fields.
			</p>
		</header>

		<div class="grid gap-4 md:grid-cols-2">
			<Field.Root name="firstName" schema={profileSchema.shape.firstName} value={firstName}>
				<Field.Label>First Name</Field.Label>
				<Input.Root>
					<Field.Control
						base={Input.Control as unknown as never}
						bind:value={firstName}
						placeholder="Maya"
					/>
				</Input.Root>
				<Field.HelperText>This will appear on your profile and team mentions.</Field.HelperText>
				<Field.Error />
			</Field.Root>

			<Field.Root name="lastName" schema={profileSchema.shape.lastName} value={lastName}>
				<Field.Label>Last Name</Field.Label>
				<Input.Root>
					<Field.Control
						base={Input.Control as unknown as never}
						bind:value={lastName}
						placeholder="Lopez"
					/>
				</Input.Root>
				<Field.Error />
			</Field.Root>

			<Field.Root
				name="email"
				schema={profileSchema.shape.email}
				value={email}
				class="md:col-span-2"
			>
				<Field.Label>Email</Field.Label>
				<Input.Root>
					<Field.Control
						base={Input.Control as unknown as never}
						type="email"
						bind:value={email}
						placeholder="maya@example.com"
					/>
				</Input.Root>
				<Field.HelperText
					>We will only use this for account and security notifications.</Field.HelperText
				>
				<Field.Error />
			</Field.Root>
		</div>

		<div class="grid gap-5 md:grid-cols-2">
			<Field.Root name="isAdmin" schema={profileSchema.shape.isAdmin} value={isAdmin}>
				<Field.Label>Administrator Access</Field.Label>
				<label class="mt-2 flex items-center gap-2 text-sm">
					<Field.Control base={Checkbox as unknown as never} bind:checked={isAdmin} />
					<span>Grant this user admin permissions</span>
				</label>
				<Field.Error />
			</Field.Root>

			<Field.Root name="theme" schema={profileSchema.shape.theme} value={theme}>
				<Field.Label>Theme</Field.Label>
				<Field.Control
					base={RadioGroup as unknown as never}
					class="mt-2 flex gap-4 text-sm"
					bind:value={theme}
				>
					<label class="flex items-center gap-2">
						<Radio value="light" />
						<span>Light</span>
					</label>
					<label class="flex items-center gap-2">
						<Radio value="dark" />
						<span>Dark</span>
					</label>
				</Field.Control>
				<Field.Error />
			</Field.Root>
		</div>

		<div class="border-t pt-4">
			<pre class="bg-muted text-muted-foreground overflow-x-auto rounded-md p-2 text-xs">
{JSON.stringify({ firstName, lastName, email, isAdmin, theme }, null, 2)}</pre>
		</div>
	</FormRoot>
</Story>

<Story name="Signup Gate">
	<div class="w-full max-w-xl">
		<FormRoot class="flex flex-col gap-4 p-5">
			<Field.Root name="name" schema={signupSchema.shape.name} value={name}>
				<Field.Label>Display Name</Field.Label>
				<Input.Root>
					<Field.Control
						base={Input.Control as unknown as never}
						placeholder="your-handle"
						bind:value={name}
					/>
				</Input.Root>
				<Field.Error />
			</Field.Root>

			<Field.Root name="agreeToTerms" schema={signupSchema.shape.agreeToTerms} value={agreeToTerms}>
				<div class="flex items-start gap-2">
					<div class="pt-0.5">
						<Field.Control base={Checkbox as unknown as never} bind:checked={agreeToTerms} />
					</div>
					<Field.Label class="text-sm leading-5">
						I confirm I have read and accept the Terms and Privacy Policy.
					</Field.Label>
				</div>
				<Field.Error />
			</Field.Root>

			<button
				type="submit"
				class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-2 text-sm"
			>
				Create account
			</button>

			<pre class="bg-muted text-muted-foreground overflow-x-auto rounded-md p-2 text-xs">
{JSON.stringify({ name, agreeToTerms }, null, 2)}</pre>
		</FormRoot>
	</div>
</Story>

<!--
	One schema on the form, no adapter. Zod issue paths are matched against each Field's `name`,
	including the nested `address.street`, so errors land on the field that caused them.
-->
<Story name="Form-level schema">
	<div class="w-full max-w-sm">
		<FormRoot class="flex flex-col gap-4 p-6" schema={accountSchema} bind:this={accountForm}>
			<header class="space-y-1">
				<h2 class="text-xl font-semibold">Account</h2>
				<p class="text-muted-foreground text-sm">
					Mode: <code>{accountMode}</code>. Blur a field, or submit, to see it fire.
				</p>
			</header>

			<Field.Root name="email" value={accountEmail} mode={accountMode}>
				<Field.Label>Email address</Field.Label>
				<Input.Root>
					<Field.Control
						base={Input.Control as unknown as never}
						type="email"
						bind:value={accountEmail}
					/>
				</Input.Root>
				<Field.Error />
			</Field.Root>

			<Field.Root name="address.street" value={accountStreet} mode={accountMode}>
				<Field.Label>Street</Field.Label>
				<Input.Root>
					<Field.Control base={Input.Control as unknown as never} bind:value={accountStreet} />
				</Input.Root>
				<Field.Error />
			</Field.Root>

			<div class="flex gap-2">
				{#each ['touched', 'blur', 'input', 'submit'] as const as option (option)}
					<button
						type="button"
						class="rounded-md border px-2 py-1 text-xs"
						class:bg-muted={accountMode === option}
						onclick={() => (accountMode = option)}
					>
						{option}
					</button>
				{/each}
			</div>

			<button
				type="submit"
				class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-2 text-sm"
			>
				Save
			</button>

			<code class="text-muted-foreground block text-xs">
				valid: {accountForm?.getBond().isValid ?? true} · touched:
				{accountForm?.getBond().isTouched ?? false} · errors:
				{accountForm?.getBond().allErrors.length ?? 0}
			</code>
		</FormRoot>
	</div>
</Story>

<!--
	The push direction: someone else owns the errors. This bag is the exact shape Superforms'
	`$errors` store publishes, which is why `<FormRoot errors={$errors}>` needs no bridge at all.
-->
<Story name="Externally owned errors">
	<div class="w-full max-w-sm">
		<FormRoot class="flex flex-col gap-4 p-6" errors={serverErrors} renderless={false}>
			<header class="space-y-1">
				<h2 class="text-xl font-semibold">Server-returned errors</h2>
				<p class="text-muted-foreground text-sm">
					No schema on the client — the errors come from outside the form entirely.
				</p>
			</header>

			<Field.Root name="username" value={serverUsername}>
				<Field.Label>Username</Field.Label>
				<Input.Root>
					<Field.Control base={Input.Control as unknown as never} bind:value={serverUsername} />
				</Input.Root>
				<Field.Error />
			</Field.Root>

			<button
				type="submit"
				class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-2 text-sm"
				onclick={() =>
					(serverErrors =
						Object.keys(serverErrors).length > 0 ? {} : { username: ['That name is taken.'] })}
			>
				Toggle server response
			</button>

			<code class="text-muted-foreground block text-xs">
				pushed: {JSON.stringify(serverErrors)}
			</code>
		</FormRoot>
	</div>
</Story>

<!--
	Superforms owns values, errors and the submit lifecycle, so the form defers on all three and
	validates nothing itself. Real usage keeps `renderless` and puts Superforms' own `use:enhance`
	on the surrounding `<form>` — an action cannot cross a component boundary.
-->
<Story name="Superforms bridge">
	<div class="w-full max-w-sm">
		<FormRoot class="flex flex-col gap-4 p-6" source={sfSource} renderless={false}>
			<header class="space-y-1">
				<h2 class="text-xl font-semibold">Shipping</h2>
				<p class="text-muted-foreground text-sm">
					Errors arrive through <code>superformsSource</code>, nested exactly as
					<code>$errors</code> publishes them.
				</p>
			</header>

			<Field.Root name="address.street" value={sfStreet}>
				<Field.Label>Street</Field.Label>
				<Input.Root>
					<Field.Control base={Input.Control as unknown as never} bind:value={sfStreet} />
				</Input.Root>
				<Field.Error />
			</Field.Root>

			<button
				type="button"
				class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-2 text-sm"
				onclick={() =>
					sfErrors.update((current) =>
						Object.keys(current).length > 0 ? {} : { address: { street: ['Street is required.'] } }
					)}
			>
				Toggle store errors
			</button>

			<code class="text-muted-foreground block text-xs">
				source errors: {sfSource.errors?.length ?? 0} · submitting: {sfSource.isSubmitting ?? false}
			</code>
		</FormRoot>
	</div>
</Story>
