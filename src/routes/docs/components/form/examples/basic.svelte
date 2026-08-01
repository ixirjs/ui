<script lang="ts">
	import { Form, Field } from '$lib/components/form';
	import { Input } from '$lib/components/input';
	import { Button } from '$lib/components/button';

	let name = $state('');
	let email = $state('');

	const commonFieldProps = {
		disabled: false,
		readonly: false,
		extend: {},
		parse: () => {}
	};
</script>

<div class="w-80">
	<Form class="flex flex-col gap-4" onsubmit={(e) => e.preventDefault()}>
		<Field.Root {...commonFieldProps} name="name">
			<Field.Label>Name</Field.Label>
			<Input.Root>
				<Field.Control
					base={Input.Control as unknown as never}
					bind:value={name}
					placeholder="Enter your name"
				/>
			</Input.Root>
		</Field.Root>

		<Field.Root {...commonFieldProps} name="email">
			<Field.Label>Email</Field.Label>
			<Input.Root>
				<Field.Control
					base={Input.Control as unknown as never}
					bind:value={email}
					type="email"
					placeholder="Enter your email"
				/>
			</Input.Root>
		</Field.Root>

		<Button type="submit">Submit</Button>
	</Form>
</div>
