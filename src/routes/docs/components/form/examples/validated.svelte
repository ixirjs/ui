<script lang="ts">
	import { Form, Field } from '$lib/components/form';
	import { Input } from '$lib/components/input';
	import { Button } from '$lib/components/button';
	import type { FieldSnippetProps } from '$lib/components/form';

	const commonFieldProps = {
		disabled: false,
		readonly: false,
		extend: {},
		parse: () => {}
	};
</script>

<div class="w-80">
	<Form class="flex flex-col gap-4" onsubmit={(e) => e.preventDefault()}>
		<Field.Root {...commonFieldProps} name="email">
			{#snippet children({ field }: FieldSnippetProps)}
				<Field.Label>Email</Field.Label>
				<Input.Root>
					<Field.Control
						base={Input.Control as unknown as never}
						type="email"
						placeholder="Enter your email"
					/>
				</Input.Root>
				{#if field?.errors.length}
					<Field.HelperText class="text-destructive">{field.errors[0]?.message}</Field.HelperText>
				{:else}
					<Field.HelperText>We'll only use this for account updates.</Field.HelperText>
				{/if}
			{/snippet}
		</Field.Root>

		<Button type="submit">Submit</Button>
	</Form>
</div>
