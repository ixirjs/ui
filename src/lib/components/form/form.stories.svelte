<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FormRoot from './form-root.svelte';
	import { Field } from './field';
	import { Input } from '$svelte-atoms/core/components/input';
	import { Checkbox } from '$svelte-atoms/core/components/checkbox';
	import { Radio, RadioGroup } from '../radio';

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
	import { ZodAdapter } from './field/validation-adapters';

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

	const validator = new ZodAdapter();

	let firstName = $state('');
	let lastName = $state('');
	let email = $state('');
	let isAdmin = $state(false);
	let theme = $state('light');

	let name = $state('');
	let agreeToTerms = $state(false);
</script>

<Story name="Basic">
	{#snippet template(args)}
		<FormRoot
			class="bg-card border-border flex w-full max-w-sm flex-col gap-4 rounded-xl border p-6"
			{validator}
		>
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
			</Field.Root>

			<button
				type="button"
				class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-2 text-sm"
			>
				Subscribe
			</button>
		</FormRoot>
	{/snippet}
</Story>

<Story name="Profile Editor">
	<FormRoot
		class="bg-card border-border flex w-full max-w-4xl flex-col gap-6 rounded-xl border p-6"
		{validator}
	>
		<header class="space-y-1">
			<h2 class="text-xl font-semibold">Team Profile</h2>
			<p class="text-muted-foreground text-sm">Composed form with text, checkbox, and radio fields.</p>
		</header>

		<div class="grid gap-4 md:grid-cols-2">
			<Field.Root name="firstName" schema={profileSchema.shape.firstName} value={firstName}>
				<Field.Label>First Name</Field.Label>
				<Input.Root>
					<Field.Control base={Input.Control as unknown as never} bind:value={firstName} placeholder="Maya" />
				</Input.Root>
				<Field.HelperText>This will appear on your profile and team mentions.</Field.HelperText>
			</Field.Root>

			<Field.Root name="lastName" schema={profileSchema.shape.lastName} value={lastName}>
				<Field.Label>Last Name</Field.Label>
				<Input.Root>
					<Field.Control base={Input.Control as unknown as never} bind:value={lastName} placeholder="Lopez" />
				</Input.Root>
			</Field.Root>

			<Field.Root name="email" schema={profileSchema.shape.email} value={email} class="md:col-span-2">
				<Field.Label>Email</Field.Label>
				<Input.Root>
					<Field.Control base={Input.Control as unknown as never} type="email" bind:value={email} placeholder="maya@example.com" />
				</Input.Root>
				<Field.HelperText>We will only use this for account and security notifications.</Field.HelperText>
			</Field.Root>
		</div>

		<div class="grid gap-5 md:grid-cols-2">
			<Field.Root name="isAdmin" schema={profileSchema.shape.isAdmin} value={isAdmin}>
				<Field.Label>Administrator Access</Field.Label>
				<label class="mt-2 flex items-center gap-2 text-sm">
					<Field.Control base={Checkbox as unknown as never} bind:checked={isAdmin} />
					<span>Grant this user admin permissions</span>
				</label>
			</Field.Root>

			<Field.Root name="theme" schema={profileSchema.shape.theme} value={theme}>
				<Field.Label>Theme</Field.Label>
				<Field.Control base={RadioGroup as unknown as never} class="mt-2 flex gap-4 text-sm" bind:value={theme}>
					<label class="flex items-center gap-2">
						<Radio value="light" />
						<span>Light</span>
					</label>
					<label class="flex items-center gap-2">
						<Radio value="dark" />
						<span>Dark</span>
					</label>
				</Field.Control>
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
		<FormRoot class="bg-card border-border flex flex-col gap-4 rounded-xl border p-5" {validator}>
			<Field.Root name="name" schema={signupSchema.shape.name} value={name}>
				<Field.Label>Display Name</Field.Label>
				<Input.Root>
					<Field.Control base={Input.Control as unknown as never} placeholder="your-handle" bind:value={name} />
				</Input.Root>
			</Field.Root>

			<Field.Root
				name="agreeToTerms"
				schema={signupSchema.shape.agreeToTerms}
				value={agreeToTerms}
			>
				<div class="flex items-start gap-2">
					<div class="pt-0.5">
						<Field.Control base={Checkbox as unknown as never} bind:checked={agreeToTerms} />
					</div>
					<Field.Label class="text-sm leading-5">
						I confirm I have read and accept the Terms and Privacy Policy.
					</Field.Label>
				</div>
			</Field.Root>

			<button type="button" class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-2 text-sm">
				Create account
			</button>

			<pre class="bg-muted text-muted-foreground overflow-x-auto rounded-md p-2 text-xs">
{JSON.stringify({ name, agreeToTerms }, null, 2)}</pre>
		</FormRoot>
	</div>
</Story>
