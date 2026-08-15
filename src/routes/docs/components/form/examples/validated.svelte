<script lang="ts">
	import { z } from 'zod';
	import { Form, Field } from '$lib/components/form';
	import { Input } from '$lib/components/input';
	import { Button } from '$lib/components/button';

	// Any Standard Schema works here — Zod, Valibot, ArkType, Effect. There is no adapter to wire.
	const schema = z.object({
		email: z.string().email('Enter a valid email address.')
	});

	let email = $state('');
</script>

<div class="w-80">
	<!--
		Default mode is `touched`: nothing shows until you leave the field, then it re-checks on every
		keystroke so the error clears as you fix it.
	-->
	<Form class="flex flex-col gap-4" {schema}>
		<Field.Root name="email" bind:value={email}>
			<Field.Label>Email</Field.Label>
			<Input.Root>
				<Field.Control base={Input.Control} type="email" placeholder="Enter your email" />
			</Input.Root>
			<Field.Error />
			<Field.HelperText>We'll only use this for account updates.</Field.HelperText>
		</Field.Root>

		<Button type="submit">Submit</Button>
	</Form>
</div>
