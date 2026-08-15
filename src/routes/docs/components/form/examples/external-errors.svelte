<script lang="ts">
	import { Form, Field } from '$lib/components/form';
	import { Input } from '$lib/components/input';
	import { Button } from '$lib/components/button';

	let username = $state('ada');
	// The shape Superforms' `$errors` store publishes, and what a server action returns. Passing it
	// straight to `errors` is the whole integration — there is nothing to adapt.
	let errors = $state<Record<string, string[]>>({});

	function submit() {
		errors = username === 'ada' ? { username: ['That name is taken.'] } : {};
	}
</script>

<div class="w-80">
	<Form class="flex flex-col gap-4" {errors} onsubmit={(e) => e.preventDefault()}>
		<Field.Root name="username" bind:value={username}>
			<Field.Label>Username</Field.Label>
			<Input.Root>
				<Field.Control base={Input.Control} placeholder="Pick a username" />
			</Input.Root>
			<Field.Error />
		</Field.Root>

		<Button type="submit" onclick={submit}>Check availability</Button>
	</Form>
</div>
